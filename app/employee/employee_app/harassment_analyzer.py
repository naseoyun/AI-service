import re
from dataclasses import dataclass

from app.schemas import CriterionResult, HarassmentAnalysisResponse


@dataclass(frozen=True)
class Signal:
    pattern: str
    weight: int
    label: str


class HarassmentAnalyzer:
    """Rule-based first-pass classifier for Korean workplace harassment risk."""

    CRITERIA = {
        "superiority": {
            "name": "우위성",
            "description": "직위, 관계, 평가권, 고용상 지위 등을 이용한 압박 정황",
            "signals": [
                Signal(r"팀장|부장|상무|대표|사장|상사|관리자", 18, "상급자 또는 관리자 언급"),
                Signal(r"인사평가|평가|승진|감봉|해고|계약연장|불이익", 24, "평가나 고용상 불이익 압박"),
                Signal(r"내가 시키면|시키는 대로|말 안 들으면|권한|보고라인", 20, "업무상 권한을 이용한 표현"),
                Signal(r"신입|막내|계약직|인턴|파견|하청", 16, "취약한 고용 또는 조직상 지위 언급"),
            ],
        },
        "work_related": {
            "name": "업무 관련성",
            "description": "업무 수행, 근무시간, 보고, 회식 등 직장 생활과 관련된 정황",
            "signals": [
                Signal(r"업무|보고|회의|근무|출근|퇴근|야근|휴가|연차|메일|메신저", 22, "업무나 근무 관련 표현"),
                Signal(r"프로젝트|성과|매출|고객|거래처|마감|자료|기획안", 18, "구체적인 업무 맥락"),
                Signal(r"회식|워크숍|출장|사무실|회사", 16, "직장 관련 장소 또는 행사"),
            ],
        },
        "beyond_scope": {
            "name": "업무상 적정범위 초과",
            "description": "업무 지시의 범위를 넘어선 모욕, 강요, 사적 지시, 과도한 압박",
            "signals": [
                Signal(r"멍청|무능|쓰레기|한심|바보|미친|꺼져|죽어|병신", 30, "모욕적 표현"),
                Signal(r"사과문|무릎|개인 심부름|사적인 일|술 따르|장기자랑", 24, "사적이거나 굴욕적인 요구"),
                Signal(r"밤새|주말.*나와|휴가.*취소|퇴근하지 마|잠 자지 말", 22, "과도한 근무 강요"),
                Signal(r"단톡.*망신|공개적으로|전체 메일|사람들 앞에서", 20, "공개적 망신 또는 모욕"),
                Signal(r"안 하면|거부하면|못 하면.*각오|책임져", 18, "위협성 조건 표현"),
            ],
        },
        "harm": {
            "name": "신체적·정신적 고통 또는 근무환경 악화",
            "description": "불안, 모욕감, 따돌림, 폭언, 업무 배제 등 피해가 드러나는 정황",
            "signals": [
                Signal(r"힘들|무섭|불안|잠이 안|우울|공황|스트레스|괴롭", 24, "정신적 고통 호소"),
                Signal(r"따돌림|무시|배제|왕따|말 걸지 마|혼자 해", 24, "관계적 배제"),
                Signal(r"폭언|욕설|협박|소리 질|고함", 24, "폭언 또는 협박"),
                Signal(r"때리|밀치|던지|신체|폭행", 30, "신체적 위협 또는 폭행"),
                Signal(r"업무를 안 줌|자리.*치움|계정.*막|회의.*빼", 22, "근무환경 악화"),
            ],
        },
        "persistence": {
            "name": "반복성·지속성",
            "description": "동일하거나 유사한 행위가 반복 또는 지속된 정황",
            "signals": [
                Signal(r"계속|매일|매번|반복|또|항상|몇 달|몇 주|수차례", 28, "반복 또는 지속 표현"),
                Signal(r"오늘도|이번에도|또다시|여전히", 18, "동일 행위 반복 정황"),
            ],
        },
    }

    def analyze(self, text: str) -> HarassmentAnalysisResponse:
        normalized_text = self._normalize(text)
        criteria = [self._evaluate_criterion(config, normalized_text) for config in self.CRITERIA.values()]
        score = self._calculate_total_score(criteria)
        evidence = self._collect_evidence(criteria)

        return HarassmentAnalysisResponse(
            probability_score=score,
            risk_level=self._risk_level(score),
            criteria=criteria,
            evidence=evidence,
            recommended_actions=self._recommended_actions(score),
            input_text=text,
            warnings=[],
            disclaimer="본 결과는 초기 위험도 분류이며, 실제 법적 판단이나 상담을 대체하지 않습니다.",
        )

    def _evaluate_criterion(self, config: dict, text: str) -> CriterionResult:
        evidence: list[str] = []
        raw_score = 0

        for signal in config["signals"]:
            if re.search(signal.pattern, text):
                raw_score += signal.weight
                evidence.append(signal.label)

        score = min(raw_score, 100)
        return CriterionResult(
            name=config["name"],
            matched=score >= 20,
            score=score,
            description=config["description"],
            evidence=evidence,
        )

    def _calculate_total_score(self, criteria: list[CriterionResult]) -> int:
        weights = {
            "우위성": 0.22,
            "업무 관련성": 0.18,
            "업무상 적정범위 초과": 0.25,
            "신체적·정신적 고통 또는 근무환경 악화": 0.25,
            "반복성·지속성": 0.10,
        }
        weighted_score = sum(item.score * weights[item.name] for item in criteria)

        core_matches = {
            item.name
            for item in criteria
            if item.matched
        }
        if {"우위성", "업무 관련성", "업무상 적정범위 초과", "신체적·정신적 고통 또는 근무환경 악화"}.issubset(core_matches):
            weighted_score += 10
        elif "업무상 적정범위 초과" in core_matches and "신체적·정신적 고통 또는 근무환경 악화" in core_matches:
            weighted_score += 5

        return min(round(weighted_score), 100)

    def _collect_evidence(self, criteria: list[CriterionResult]) -> list[str]:
        evidence = []
        for item in criteria:
            if item.evidence:
                evidence.append(f"{item.name}: {', '.join(item.evidence)}")
        return evidence

    def _recommended_actions(self, score: int) -> list[str]:
        base_actions = [
            "원본 캡처, 날짜, 대화 상대, 전후 맥락을 보존하세요.",
            "추가 대화는 감정적 대응보다 사실 기록 중심으로 남기세요.",
        ]
        if score >= 75:
            return [
                "사내 신고 채널, 노동청, 노무사 상담 등 공식 대응을 빠르게 검토하세요.",
                "반복 행위가 있다면 날짜별 타임라인을 정리하세요.",
                *base_actions,
            ]
        if score >= 50:
            return [
                "동일 행위가 반복되는지 기록하고 증거를 모으세요.",
                "신뢰 가능한 담당자나 외부 상담 창구에 1차 상담을 요청하세요.",
                *base_actions,
            ]
        if score >= 25:
            return [
                "현재 자료만으로는 판단이 제한적이므로 추가 맥락과 반복 여부를 기록하세요.",
                *base_actions,
            ]
        return [
            "직장 내 괴롭힘 가능성은 낮게 감지되지만, 불쾌감이나 불이익이 있었다면 기록을 남기세요.",
            *base_actions,
        ]

    def _risk_level(self, score: int) -> str:
        if score >= 85:
            return "critical"
        if score >= 65:
            return "high"
        if score >= 35:
            return "medium"
        return "low"

    def _normalize(self, text: str) -> str:
        return re.sub(r"\s+", " ", text.strip())