#!/usr/bin/env python3
# Transforms a colleges-sample-NNN.json export (the real production /colleges
# and /colleges/:slug API shape -- see the export's own _readme field) into
# ready-to-paste TypeScript object-literal source for data.ts's `College[]`
# and extra.ts's `EXTRA: Record<string, CollegeExtra>`, matching OUR existing
# field names/shape rather than the API's. Used 14 Sept 2026 to add 25 real
# colleges alongside the prototype's fabricated entries (see
# docs/COLLEGE_LOOKUP_AUDIT.md sec 9 and docs/AI_HANDOFF.md for that round).
#
# Deliberately does not touch photo/mark (no image fetching here -- see
# fetch-images.mjs) and never renders an absent real value as zero/dash; a
# genuinely null field is either omitted (for optional TS fields) or passed
# through as `null` (for fields typed `T | null`), per the export's own
# absence-is-a-real-state rule.
#
# Usage:
#   python3 scripts/colleges/transform-real-data.py <path-to-colleges-sample.json> <slug1> [slug2 ...]
#
# Prints two TS-ready blocks to stdout, separated by a marker line, for you
# to paste into data.ts (before its COLLEGES array's closing `];`) and
# extra.ts (before its EXTRA object's closing `};`). Anchor the paste on an
# exact, verified line index -- not a generic `];`/`};` string search, which
# silently lands inside data.ts's synthDetail() function instead of the
# COLLEGES array (see docs/AI_HANDOFF.md for the incident this note prevents).
import json, re, sys

def js(s):
    if s is None:
        return "null"
    return json.dumps(s)

def js_arr(items):
    return "[" + ", ".join(js(i) for i in items) + "]"

def level_from_type(t):
    if t.startswith("Less-than-two-year"):
        return "Certificates"
    if t.startswith("Two-year"):
        return "Associate degrees"
    return "Bachelor's degrees"

def control_from_type(t):
    if "for-profit" in t:
        return "For profit"
    if "private" in t:
        return "Private"
    return "Public"

SETTING_MAP = {"city": "City", "suburb": "Suburb", "town": "Town", "rural": "Countryside"}

def size_from(n):
    if n is None:
        return "Small"
    if n < 5000:
        return "Small"
    if n < 20000:
        return "Medium"
    return "Large"

def admission_from(a):
    if a.get("openAdmission"):
        return "open", None
    rate = a.get("acceptanceRate")
    if rate is not None:
        band = "more" if rate < 50 else "grades"
        return band, round(rate)
    return "grades", None

def ratio_str(n):
    if n is None:
        return "Not published"
    return f"{round(n)} to 1"

def money_or_none(n):
    return "null" if n is None else str(round(n))

def pct_or_none(n, keep_decimal=False):
    if n is None:
        return None
    return round(n, 1) if keep_decimal else round(n)

def sat_combo_str(sr, sm):
    if not sr or not sm:
        return None
    return f"{sr[0]+sm[0]} to {sr[1]+sm[1]}"

def act_str(ac):
    if not ac:
        return None
    return f"{ac[0]} to {ac[1]}"

def address_line(p):
    addr = p.get("address") or ""
    parts = [addr, p.get("city", ""), p.get("stateName", "")]
    return ", ".join([x for x in parts if x])

def maps_url(p):
    q = address_line(p)
    from urllib.parse import quote
    return f"https://www.google.com/maps/search/?api=1&query={quote(q)}"

def ways_list(campus):
    out = []
    if campus.get("studyAbroad"):
        out.append("Study abroad")
    if campus.get("undergraduateResearch"):
        out.append("Undergraduate research")
    if campus.get("rotc"):
        branches = []
        if campus.get("rotcArmy"): branches.append("Army")
        if campus.get("rotcNavy"): branches.append("Navy")
        if campus.get("rotcAirForce"): branches.append("Air Force")
        out.append(f"ROTC ({', '.join(branches)})" if branches else "ROTC")
    return out

def helps_list(campus):
    out = []
    if campus.get("employmentServices") or campus.get("placementServices"):
        out.append("Help finding work while you study")
    return out

def group_programs_by_level(programs):
    buckets = {}
    for p in programs:
        label = p.get("awardLabel") or "Other"
        if "Bachelor" in label:
            key = "Bachelor's degrees"
        elif "Master" in label:
            key = "Master's degrees"
        elif "Doctor" in label or "First Professional" in label:
            key = "Doctorates"
        elif "Associate" in label:
            key = "Associate degrees"
        elif "Certificate" in label:
            key = "Certificates"
        else:
            key = label
        buckets.setdefault(key, []).append(p)
    for key in buckets:
        buckets[key].sort(key=lambda p: p.get("completions") or 0, reverse=True)
    return buckets

def pay_label(p):
    status = p.get("earningsStatus")
    earn = p.get("medianEarnings1yr")
    if earn:
        return f"${earn:,}"
    if status == "TOO_FEW":
        return "too few graduates"
    return "not reported"

def emit_college(cols, slug):
    rec = cols[slug]
    card = rec["card"]
    p = rec["profile"]
    name = p["name"]
    ctype = p["type"]
    level = level_from_type(ctype)
    control = control_from_type(ctype)
    setting = SETTING_MAP.get(p.get("setting"), "City")
    enr = p.get("enrollment") or {}
    undergrads = enr.get("totalUndergrad") or card.get("graduates") or 0
    size = size_from(undergrads)
    admission_word, admit_rate = admission_from(p["admission"])
    net_price = p.get("netPriceAll")
    finish = pct_or_none(p.get("gradRate150"))
    retention = p.get("retentionFullTime")
    repay = pct_or_none(p.get("repaymentRate5yr"))
    accreditor = p.get("accreditor") or "Not accredited"
    website = p.get("websiteUrl")

    top = (
        f'{{ slug: {js(slug)}, name: {js(name)}, city: {js(p["city"])}, state: {js(p["state"])}, stateName: {js(p["stateName"])}, '
        f'level: {js(level)}, control: {js(control)}, setting: {js(setting)}, size: {js(size)}, undergrads: {undergrads}, '
        f'netPrice: {money_or_none(net_price)}, finish: {"null" if finish is None else finish}, retention: {"null" if retention is None else retention}, '
        f'repay: {"null" if repay is None else repay}, gradsPerYear: {card.get("graduates") or 0}, accreditor: {js(accreditor)}, '
        f'admission: {js(admission_word)}, admitRate: {"null" if admit_rate is None else admit_rate}, website: {js(website)}, photo: false, mark: false,'
    )

    housing = bool(p.get("providesHousing"))
    housing_cost = p.get("housingAmount")
    food_cost = p.get("foodAmount")
    bands = []
    for b in p.get("netPriceByBand") or []:
        if b.get("netPrice") is not None:
            bands.append((b["band"], round(b["netPrice"])))
    require = p["admission"].get("requires") or []
    consider = p["admission"].get("considers") or []
    satR = p["admission"].get("satReading")
    satM = p["admission"].get("satMath")
    act = p["admission"].get("actComposite")
    sat_combo = sat_combo_str(satR, satM)
    act_combo = act_str(act)
    finish4 = p.get("bachelorRate4yr")
    programme_count = p.get("totalPrograms") or len(p.get("programs") or [])
    grad_students = enr.get("totalGraduate")
    full_time = enr.get("fullTime") or 0
    part_time = enr.get("partTime") or 0
    demo = enr.get("demographics") or {}
    base_for_pct = undergrads or enr.get("totalAll") or 1
    women_ct = demo.get("women")
    men_ct = demo.get("men")
    women_pct = round((women_ct / base_for_pct) * 100) if women_ct is not None and base_for_pct else None
    men_pct = round((men_ct / base_for_pct) * 100) if men_ct is not None and base_for_pct else None
    makeup = []
    DEMO_RELABEL = {"U.S. nonresident": "International"}
    for g in demo.get("groups") or []:
        cnt = g.get("count") or 0
        if cnt <= 0:
            continue
        pct = round((cnt / base_for_pct) * 100)
        if pct <= 0:
            continue
        label = DEMO_RELABEL.get(g["label"], g["label"])
        makeup.append((label, cnt, pct))
    ways = ways_list(p.get("campus") or {})
    helps = helps_list(p.get("campus") or {})
    campus = p.get("campus") or {}
    sport = None
    sports = campus.get("sports") or []
    if sports:
        league = campus.get("athleticDivision") or ("NCAA" if campus.get("ncaa") else "NAIA" if campus.get("naia") else "Not published")
        students = (campus.get("athletesMen") or 0) + (campus.get("athletesWomen") or 0)
        team_names = [s["sport"] for s in sports if s.get("sport")]
        sport = (league, students, team_names)
    scholarship_share = pct_or_none(p.get("pctInstitutionalGrant"))
    pell = pct_or_none(p.get("pctPellGrant"))
    pay6 = p.get("medianEarnings6yr")
    debt = p.get("medianDebt")
    monthly = p.get("monthlyPayment10yr")

    levels_fallback = []
    programmes_fallback = []
    buckets = group_programs_by_level(p.get("programs") or [])
    all_progs_sorted = sorted(p.get("programs") or [], key=lambda pr: pr.get("completions") or 0, reverse=True)
    total_grads = sum((pr.get("completions") or 0) for pr in (p.get("programs") or [])) or 1
    for lvl, progs in buckets.items():
        levels_fallback.append((lvl, len(progs)))
    for pr in all_progs_sorted[:8]:
        share = round(((pr.get("completions") or 0) / total_grads) * 100)
        programmes_fallback.append((pr["programName"], pr.get("completions") or 0, share, pay_label(pr)))

    detail_parts = []
    detail_parts.append(f'address: {js(address_line(p))}')
    if p.get("parentSystem") and p["parentSystem"].lower() not in name.lower():
        detail_parts.append(f'partOf: {js(p["parentSystem"])}')
    detail_parts.append(f'tuitionInState: {money_or_none(p.get("tuitionInState"))}')
    detail_parts.append(f'tuitionOutState: {money_or_none(p.get("tuitionOutOfState"))}')
    detail_parts.append(f'fees: {money_or_none(p.get("feesInState"))}')
    detail_parts.append(f'housing: {"true" if housing else "false"}')
    if housing_cost is not None:
        detail_parts.append(f'housingCost: {round(housing_cost)}')
    if food_cost is not None:
        detail_parts.append(f'foodCost: {round(food_cost)}')
    bands_str = "[" + ", ".join(f'{{ label: {js(l)}, pay: {v} }}' for l, v in bands) + "]"
    detail_parts.append(f'bands: {bands_str}')
    if scholarship_share is not None:
        detail_parts.append(f'scholarshipShare: {scholarship_share}')
    if pell is not None:
        detail_parts.append(f'pell: {pell}')
    detail_parts.append(f'require: {js_arr(require)}')
    detail_parts.append(f'consider: {js_arr(consider)}')
    if sat_combo:
        sat_submit = p["admission"].get("satSubmitPct")
        scores_bits = [f'sat: {js(sat_combo)}', f'sentSat: {sat_submit if sat_submit is not None else 0}']
        if act_combo:
            act_submit = p["admission"].get("actSubmitPct")
            scores_bits.append(f'act: {js(act_combo)}')
            scores_bits.append(f'sentAct: {act_submit if act_submit is not None else 0}')
        detail_parts.append('scores: { ' + ", ".join(scores_bits) + ' }')
    if finish4 is not None:
        detail_parts.append(f'finish4: {round(finish4)}')
    detail_parts.append(f'ratio: {js(ratio_str(p.get("studentFacultyRatio")))}')
    detail_parts.append(f'programmeCount: {programme_count}')
    levels_str = "[" + ", ".join(f'{{ label: {js(l)}, n: {n} }}' for l, n in levels_fallback) + "]"
    detail_parts.append(f'levels: {levels_str}')
    progs_str = "[" + ", ".join(
        f'{{ name: {js(n)}, grads: {g}, share: {s}, pay: {js(pay)} }}' for n, g, s, pay in programmes_fallback
    ) + "]"
    detail_parts.append(f'programmes: {progs_str}')
    if grad_students:
        detail_parts.append(f'gradStudents: {grad_students}')
    detail_parts.append(f'fullTime: {full_time}')
    detail_parts.append(f'partTime: {part_time}')
    detail_parts.append(f'women: {women_pct if women_pct is not None else 0}')
    detail_parts.append(f'men: {men_pct if men_pct is not None else 0}')
    makeup_str = "[" + ", ".join(f'{{ label: {js(l)}, n: {n}, pct: {pc} }}' for l, n, pc in makeup) + "]"
    detail_parts.append(f'makeup: {makeup_str}')
    detail_parts.append(f'ways: {js_arr(ways)}')
    detail_parts.append(f'helps: {js_arr(helps)}')
    if sport:
        league, students, teams = sport
        detail_parts.append(f'sport: {{ league: {js(league)}, students: {students}, teams: {js_arr(teams)} }}')
    detail_parts.append(f'pay6: {money_or_none(pay6)}')
    detail_parts.append(f'debt: {money_or_none(debt)}')
    if monthly is not None:
        detail_parts.append(f'monthly: {round(monthly)}')

    detail_str = "detail: { " + ", ".join(detail_parts) + " }"

    return top + " " + detail_str + " },"


def emit_extra(cols, slug):
    rec = cols[slug]
    p = rec["profile"]
    campus = p.get("campus") or {}
    admission = p["admission"]

    def score_range(lo_hi, sent):
        if not lo_hi:
            return "null"
        lo, hi = lo_hi
        s = sent if sent is not None else 0
        return f'{{ lo: {lo}, hi: {hi}, sent: {s} }}'

    satR = score_range(admission.get("satReading"), admission.get("satSubmitPct"))
    satM = score_range(admission.get("satMath"), admission.get("satSubmitPct"))
    act = score_range(admission.get("actComposite"), admission.get("actSubmitPct"))

    ways = ways_list(campus)
    ways_str = "[" + ", ".join(f'{{ name: {js(w)} }}' for w in ways) + "]"

    buckets = group_programs_by_level(p.get("programs") or [])
    counts = {}
    programmes = {}
    for lvl, progs in buckets.items():
        counts[lvl] = len(progs)
        total = sum((pr.get("completions") or 0) for pr in progs) or 1
        rows = []
        for pr in progs[:10]:
            share_pct = round(((pr.get("completions") or 0) / total) * 100)
            rows.append(
                f'{{ name: {js(pr["programName"])}, grads: {pr.get("completions") or 0}, share: {js(str(share_pct) + "%")}, pay: {js(pay_label(pr))} }}'
            )
        programmes[lvl] = rows

    counts_str = "{ " + ", ".join(f'{js(k)}: {v}' for k, v in counts.items()) + " }"
    programmes_str = "{ " + ", ".join(f'{js(k)}: [{", ".join(v)}]' for k, v in programmes.items()) + " }"

    links = (
        f'links: {{ aid: {js(p.get("financialAidUrl"))}, apply: {js(p.get("applicationUrl"))}, '
        f'calc: {js(p.get("netPriceCalcUrl"))}, site: {js(p.get("websiteUrl"))}, map: {js(maps_url(p))} }}'
    )

    return (
        f' {js(slug)}: {{\n'
        f'  {links},\n'
        f'  finish5: null, finish6b: null, finish6ft: null, finish8: null, retPart: null,\n'
        f'  meal: null, fallBehind: null,\n'
        f'  satR: {satR}, satM: {satM}, act: {act},\n'
        f'  teamMen: null, teamWomen: null,\n'
        f'  ways: {ways_str}, notOffered: [],\n'
        f'  counts: {counts_str},\n'
        f'  programmes: {programmes_str},\n'
        f' }},'
    )


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__ if __doc__ else "Usage: transform-real-data.py <sample.json> <slug> [slug...]", file=sys.stderr)
        sys.exit(1)
    src_path = sys.argv[1]
    slugs = sys.argv[2:]
    with open(src_path) as f:
        data = json.load(f)
    cols = {c["slug"]: c for c in data["colleges"]}

    out_data, out_extra = [], []
    for slug in slugs:
        if slug not in cols:
            print(f"WARNING: {slug} not found in {src_path}", file=sys.stderr)
            continue
        try:
            out_data.append(emit_college(cols, slug))
        except Exception as e:
            print(f"ERROR data {slug}: {e}", file=sys.stderr)
        try:
            out_extra.append(emit_extra(cols, slug))
        except Exception as e:
            print(f"ERROR extra {slug}: {e}", file=sys.stderr)

    print("\n".join(out_data))
    print("\n// ---- extra.ts block below this line ----\n")
    print("\n".join(out_extra))
