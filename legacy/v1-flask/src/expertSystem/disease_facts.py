"""Medical reference data for supported lesion classes.

This module defines a simple dictionary of facts keyed by the seven
`HAM10000` labels used elsewhere in the project (``akiec``, ``bcc`` etc.).
The chatbot can look up these entries via a tool call and present the
information to users upon request.
"""

from typing import Dict, Any

# Information is intentionally fairly detailed to support the chat bot giving
# concise yet clinically accurate answers.  Entries are keyed by the internal
# label codes; the lookup helper in :mod:`chat` will also accept common names.
DISEASE_FACTS: Dict[str, Dict[str, Any]] = {
    "akiec": {
        "name": "Actinic keratoses / intraepithelial carcinoma (AKIEC)",
        "description": (
            "Precancerous, scaly or crusted patches that develop on chronically sun-exposed "
            "skin. They often feel rough and may bleed if scraped. AKIEC represents a more "
            "advanced, intraepithelial form of actinic keratosis."
        ),
        "common_age": ">50 years",
        "common_locations": ["face", "scalp", "ears", "dorsal hands", "forearms"],
        "risk_factors": ["cumulative UV exposure", "fair skin", "older age", "immunosuppression"],
        "notes": (
            "Can progress to invasive squamous cell carcinoma if untreated; early treatment "
            "(cryotherapy, topical 5‑FU/imiquimod, photodynamic therapy, or excision) "
            "reduces risk. Monitor for persistence or change."
        ),
    },
    "bcc": {
        "name": "Basal cell carcinoma (BCC)",
        "description": (
            "The most common skin cancer, typically a slow-growing pearly or ulcerated "
            "nodule often with telangiectasia. Rarely metastasizes but can be locally "
            "destructive."
        ),
        "common_age": ">50 years",
        "common_locations": ["face", "neck", "trunk", "ears"],
        "risk_factors": ["chronic UV exposure", "fair skin", "age", "radiation exposure", "immunosuppression"],
        "notes": (
            "Arises in sun-exposed areas; may appear as a pearly papule with rolled border, "
            "central ulceration, or scaly patch. Diagnosis by biopsy; treatment options "
            "include surgical excision, Mohs micrographic surgery, topical agents, or "
            "radiation."
        ),
    },
    "bkl": {
        "name": "Benign keratosis / seborrheic keratosis (BK, BKL)",
        "description": (
            "Common benign epidermal growths that appear as stuck-on, waxy, rough or smooth "
            "plaques ranging from light tan to dark brown."
        ),
        "common_age": "middle-aged to elderly",
        "common_locations": ["trunk", "face", "neck", "extremities"],
        "risk_factors": ["age", "genetics"],
        "notes": (
            "Also called seborrheic keratoses or senile warts; not related to sun exposure. "
            "Harmless but may be removed for cosmetic reasons or if irritated or bleeding."
        ),
    },
    "df": {
        "name": "Dermatofibroma (DF)",
        "description": (
            "Benign fibrous papule or nodule usually firm and tethered to the skin; "
            "hyperpigmented brown to pink."
        ),
        "common_age": "young adults",
        "common_locations": ["legs", "arms", "trunk"],
        "risk_factors": ["minor skin trauma", "insect bites"],
        "notes": (
            "Often asymptomatic but may itch or be tender. The 'dimple sign' (central "
            "depression when pinched) is classic. No malignant potential; can be excised "
            "if bothersome."
        ),
    },
    "mel": {
        "name": "Melanoma",
        "description": (
            "Malignant tumor of melanocytes; highly aggressive and potentially fatal. "
            "Presents as an asymmetric, irregularly bordered, multicolored lesion that may "
            "evolve over time."
        ),
        "common_age": "any age (peaks in early adulthood and after 60)",
        "common_locations": ["back", "legs", "arms", "face", "sun-exposed sites"],
        "risk_factors": ["UV exposure", "fair skin", "numerous nevi", "family history of melanoma", "dysplastic nevus syndrome"],
        "notes": (
            "Early detection is critical. Use ABCDE criteria (Asymmetry, Border irregularity, "
            "Color variation, Diameter >6 mm, Evolution). Biopsy suspicious lesions; "
            "treatment is surgical excision with margins and may include immunotherapy or "
            "targeted therapy for advanced disease."
        ),
    },
    "nv": {
        "name": "Melanocytic nevus (mole)",
        "description": (
            "Benign proliferation of melanocytes forming flat or raised pigmented macules "
            "or papules, usually uniform in color."
        ),
        "common_age": "childhood through adulthood",
        "common_locations": ["any skin site"],
        "risk_factors": ["genetics", "sun exposure"],
        "notes": (
            "Most nevi are harmless; monitor for change using ABCDE criteria. Atypical or "
            "dysplastic nevi carry a higher melanoma risk and may require dermatologic "
            "follow-up."
        ),
    },
    "vasc": {
        "name": "Vascular lesion (angioma, angiokeratoma, hemorrhage)",
        "description": (
            "Benign blood vessel proliferation or hemorrhagic spot appearing as red, blue, "
            "or purple macules or papules."
        ),
        "common_age": "any age (angiomas often in adults; angiokeratomas in older adults)",
        "common_locations": ["trunk", "legs", "face", "mucosal surfaces"],
        "risk_factors": ["age", "genetics"],
        "notes": (
            "Includes cherry angiomas, spider angiomas, hemangiomas, and angiokeratomas. "
            "Generally harmless; treatments such as laser or electrocautery are available "
            "if bleeding or for cosmetic reasons."
        ),
    },
}


def get_facts_for(query: str) -> Dict[str, Any]:
    """Return the disease facts for a given label or name.

    The query may be an internal code ("mel", "bcc") or any part of the
    common name. Matching is case‑insensitive. If no entry is found, an empty
    dict is returned.
    """
    if not query:
        return {}
    key = query.strip().lower()
    # direct key match
    if key in DISEASE_FACTS:
        return DISEASE_FACTS[key]
    # search within names
    for v in DISEASE_FACTS.values():
        name = v.get("name", "").lower()
        if key in name:
            return v
    return {}
