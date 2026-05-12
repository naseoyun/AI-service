from app.harassment_analyzer import HarassmentAnalyzer


def test_high_risk_message_scores_high() -> None:
    analyzer = HarassmentAnalyzer()

    result = analyzer.analyze(
        "팀장이 오늘도 단톡방에서 무능하다고 공개적으로 망신을 줬고 "
        "야근 안 하면 인사평가 불이익을 주겠다고 계속 협박했습니다. 너무 불안합니다."
    )

    assert result.probability_score >= 65
    assert result.risk_level in {"high", "critical"}
    assert any(item.name == "우위성" and item.matched for item in result.criteria)
    assert any(item.name == "업무상 적정범위 초과" and item.matched for item in result.criteria)


def test_low_context_message_scores_low() -> None:
    analyzer = HarassmentAnalyzer()

    result = analyzer.analyze("내일 회의 자료를 오전까지 공유 부탁드립니다.")

    assert result.probability_score < 35
    assert result.risk_level == "low"