import re


SKILL_KEYWORDS = {
    "IT": [
        "IT",
        "\ucf54\ub529",
        "\uac1c\ubc1c",
        "\ud504\ub85c\uadf8\ub798\ubc0d",
        "\ud648\ud398\uc774\uc9c0",
        "\uc6f9",
        "\uc571",
        "\ub370\uc774\ud130",
        "\uc5d1\uc140",
        "Excel",
    ],
    "Design": [
        "\ub514\uc790\uc778",
        "\ube0c\ub79c\ub529",
        "\ud3ec\uc2a4\ud130",
        "\uc601\uc0c1",
        "\ucf58\ud150\uce20",
        "\ud64d\ubcf4\ubb3c",
    ],
    "Marketing": [
        "\ub9c8\ucf00\ud305",
        "\ud64d\ubcf4",
        "SNS",
        "\ucea0\ud398\uc778",
        "\uae30\ud68d",
    ],
    "Education": [
        "\uad50\uc721",
        "\uac15\uc758",
        "\uba58\ud1a0",
        "\uba58\ud1a0\ub9c1",
        "\ud559\uc2b5",
        "\uc9c4\ub85c",
    ],
    "Translation": [
        "\ubc88\uc5ed",
        "\ud1b5\uc5ed",
        "\uc601\uc5b4",
        "\uc911\uad6d\uc5b4",
        "\uc77c\ubcf8\uc5b4",
    ],
    "Counseling": [
        "\uc0c1\ub2f4",
        "\uc2ec\ub9ac",
        "\ucf54\uce6d",
        "\uba74\uc811",
        "\uc774\ub825\uc11c",
    ],
    "Administration": [
        "\ud589\uc815",
        "\ubb38\uc11c",
        "\uc790\ub8cc",
        "\uc811\uc218",
        "\uc548\ub0b4",
    ],
    "Medical": [
        "\uc758\ub8cc",
        "\uac04\ud638",
        "\ubcf4\uac74",
        "\uc7ac\ud65c",
    ],
    "Performance": [
        "\uacf5\uc5f0",
        "\uc74c\uc545",
        "\uc545\uae30",
        "\ud569\ucc3d",
        "\uc624\ucf00\uc2a4\ud2b8\ub77c",
    ],
}


def extract_required_skills(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text)
    skills = []
    for skill, keywords in SKILL_KEYWORDS.items():
        if any(keyword.lower() in normalized.lower() for keyword in keywords):
            skills.append(skill)
    return skills or ["General support"]