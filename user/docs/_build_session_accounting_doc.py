from __future__ import annotations

from pathlib import Path
from datetime import date

from PIL import Image, ImageDraw, ImageFont

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "Giai_phap_dong_bo_Session_Accounting_UniFi_v2.docx"
ASSET_DIR = ROOT / "_session_accounting_assets"
ASSET_DIR.mkdir(exist_ok=True)

NAVY = "16324F"
BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
INK = "1F2937"
MUTED = "5B6573"
LIGHT_BLUE = "E8EEF5"
LIGHT_GRAY = "F2F4F7"
LIGHT_GREEN = "E8F3EC"
LIGHT_GOLD = "FFF4D6"
LIGHT_RED = "FDECEC"
WHITE = "FFFFFF"
BORDER = "CAD2DC"


def rgb(hex_color: str) -> RGBColor:
    return RGBColor.from_string(hex_color)


def set_cell_shading(cell, fill: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color=BORDER, size="6"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.find(qn("w:tblBorders"))
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        elem = borders.find(qn(f"w:{edge}"))
        if elem is None:
            elem = OxmlElement(f"w:{edge}")
            borders.append(elem)
        elem.set(qn("w:val"), "single")
        elem.set(qn("w:sz"), size)
        elem.set(qn("w:color"), color)


def set_table_geometry(table, widths_dxa: list[int], indent_dxa=120):
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    total = sum(widths_dxa)
    tbl_pr = table._tbl.tblPr

    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(total))
    tbl_w.set(qn("w:type"), "dxa")

    tbl_layout = tbl_pr.find(qn("w:tblLayout"))
    if tbl_layout is None:
        tbl_layout = OxmlElement("w:tblLayout")
        tbl_pr.append(tbl_layout)
    tbl_layout.set(qn("w:type"), "fixed")

    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(indent_dxa))
    tbl_ind.set(qn("w:type"), "dxa")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            width = widths_dxa[min(idx, len(widths_dxa) - 1)]
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(width))
            tc_w.set(qn("w:type"), "dxa")
            set_cell_margins(cell)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    tr_pr.append(header)


def keep_with_next(paragraph):
    paragraph.paragraph_format.keep_with_next = True


def set_font(run, name="Calibri", size=None, bold=None, color=None, italic=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color is not None:
        run.font.color.rgb = rgb(color)
    if italic is not None:
        run.italic = italic


def set_cell_text(cell, text, *, bold=False, color=INK, align=WD_ALIGN_PARAGRAPH.LEFT, size=9.2):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.08
    r = p.add_run(str(text))
    set_font(r, size=size, bold=bold, color=color)


def add_table(doc, headers: list[str], rows: list[list[str]], widths_dxa: list[int], header_fill=LIGHT_BLUE):
    table = doc.add_table(rows=1, cols=len(headers))
    set_table_geometry(table, widths_dxa)
    set_table_borders(table)
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for i, h in enumerate(headers):
        set_cell_shading(hdr.cells[i], header_fill)
        set_cell_text(hdr.cells[i], h, bold=True, color=NAVY, size=9.1)
    for row_idx, values in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(values):
            set_cell_text(cells[i], value, size=9.0)
            if row_idx % 2 == 1:
                set_cell_shading(cells[i], "FAFBFC")
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(1)
    return table


def add_callout(doc, label: str, text: str, fill=LIGHT_BLUE, accent=BLUE):
    table = doc.add_table(rows=1, cols=1)
    set_table_geometry(table, [9360])
    set_table_borders(table, color=accent, size="8")
    cell = table.cell(0, 0)
    set_cell_shading(cell, fill)
    set_cell_margins(cell, top=140, bottom=140, start=180, end=180)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(label.upper())
    set_font(r, size=9, bold=True, color=accent)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_before = Pt(0)
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.12
    r2 = p2.add_run(text)
    set_font(r2, size=10.2, color=INK)
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(1)


def add_code_block(doc, text: str):
    table = doc.add_table(rows=1, cols=1)
    set_table_geometry(table, [9360])
    set_table_borders(table, color="CBD5E1", size="5")
    cell = table.cell(0, 0)
    set_cell_shading(cell, "F7F8FA")
    set_cell_margins(cell, top=120, bottom=120, start=160, end=160)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    r = p.add_run(text)
    set_font(r, name="Courier New", size=8.7, color="243447")
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_after = Pt(1)


def add_hyperlink(paragraph, text: str, url: str):
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)
    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), BLUE)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.append(color)
    r_pr.append(underline)
    new_run.append(r_pr)
    text_node = OxmlElement("w:t")
    text_node.text = text
    new_run.append(text_node)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_field(paragraph, field: str):
    run = paragraph.add_run()
    fld_char = OxmlElement("w:fldChar")
    fld_char.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = field
    sep = OxmlElement("w:fldChar")
    sep.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:t")
    placeholder.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char, instr, sep, placeholder, end])
    set_font(run, size=9, color=MUTED)


def add_numbering_definition(doc: Document, *, bullet: bool) -> int:
    numbering = doc.part.numbering_part.element
    abstract_ids = [int(e.get(qn("w:abstractNumId"))) for e in numbering.findall(qn("w:abstractNum"))]
    num_ids = [int(e.get(qn("w:numId"))) for e in numbering.findall(qn("w:num"))]
    abstract_id = max(abstract_ids, default=0) + 1
    num_id = max(num_ids, default=0) + 1

    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(abstract_id))
    multi = OxmlElement("w:multiLevelType")
    multi.set(qn("w:val"), "singleLevel")
    abstract.append(multi)
    lvl = OxmlElement("w:lvl")
    lvl.set(qn("w:ilvl"), "0")
    start = OxmlElement("w:start")
    start.set(qn("w:val"), "1")
    lvl.append(start)
    num_fmt = OxmlElement("w:numFmt")
    num_fmt.set(qn("w:val"), "bullet" if bullet else "decimal")
    lvl.append(num_fmt)
    lvl_text = OxmlElement("w:lvlText")
    lvl_text.set(qn("w:val"), "•" if bullet else "%1.")
    lvl.append(lvl_text)
    suff = OxmlElement("w:suff")
    suff.set(qn("w:val"), "tab")
    lvl.append(suff)
    p_pr = OxmlElement("w:pPr")
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "num")
    tab.set(qn("w:pos"), "540")
    tabs.append(tab)
    p_pr.append(tabs)
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "540")
    ind.set(qn("w:hanging"), "270")
    p_pr.append(ind)
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:after"), "80")
    spacing.set(qn("w:line"), "300")
    spacing.set(qn("w:lineRule"), "auto")
    p_pr.append(spacing)
    lvl.append(p_pr)
    if bullet:
        r_pr = OxmlElement("w:rPr")
        fonts = OxmlElement("w:rFonts")
        fonts.set(qn("w:ascii"), "Symbol")
        fonts.set(qn("w:hAnsi"), "Symbol")
        r_pr.append(fonts)
        lvl.append(r_pr)
    abstract.append(lvl)
    numbering.append(abstract)

    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id))
    abstract_ref = OxmlElement("w:abstractNumId")
    abstract_ref.set(qn("w:val"), str(abstract_id))
    num.append(abstract_ref)
    numbering.append(num)
    return num_id


def apply_numbering(paragraph, num_id: int):
    p_pr = paragraph._p.get_or_add_pPr()
    num_pr = p_pr.find(qn("w:numPr"))
    if num_pr is None:
        num_pr = OxmlElement("w:numPr")
        p_pr.append(num_pr)
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "0")
    num = OxmlElement("w:numId")
    num.set(qn("w:val"), str(num_id))
    num_pr.extend([ilvl, num])


def add_list_item(doc, text: str, num_id: int):
    p = doc.add_paragraph()
    apply_numbering(p, num_id)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    r = p.add_run(text)
    set_font(r, size=10.4, color=INK)
    return p


def add_heading(doc, text: str, level: int):
    p = doc.add_paragraph(text, style=f"Heading {level}")
    keep_with_next(p)
    return p


def add_body(doc, text: str, *, bold_prefix: str | None = None):
    p = doc.add_paragraph()
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        set_font(r1, size=10.4, bold=True, color=INK)
        r2 = p.add_run(text[len(bold_prefix):])
        set_font(r2, size=10.4, color=INK)
    else:
        r = p.add_run(text)
        set_font(r, size=10.4, color=INK)
    return p


def add_caption(doc, text: str):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(text)
    set_font(r, size=9, italic=True, color=MUTED)
    return p


FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def _font(size: int, bold=False):
    path = FONT_BOLD if bold else FONT_REGULAR
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def _center_text(draw, xy, text, font, fill, spacing=5):
    box = draw.multiline_textbbox((0, 0), text, font=font, align="center", spacing=spacing)
    w, h = box[2] - box[0], box[3] - box[1]
    draw.multiline_text((xy[0] - w / 2, xy[1] - h / 2), text, font=font, fill=fill, align="center", spacing=spacing)


def _arrow(draw, start, end, fill="#2E74B5", width=5):
    draw.line([start, end], fill=fill, width=width)
    import math
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    length = 16
    wing = 0.55
    p1 = (end[0] - length * math.cos(angle - wing), end[1] - length * math.sin(angle - wing))
    p2 = (end[0] - length * math.cos(angle + wing), end[1] - length * math.sin(angle + wing))
    draw.polygon([end, p1, p2], fill=fill)


def draw_architecture(path: Path):
    image = Image.new("RGB", (2200, 900), "white")
    draw = ImageDraw.Draw(image)
    title_font = _font(42, True)
    head_font = _font(31, True)
    body_font = _font(23)
    label_font = _font(20)
    _center_text(draw, (1100, 68), "KIẾN TRÚC LOGICAL", title_font, f"#{NAVY}")

    def box(x, y, w, h, title, subtitle, fc):
        draw.rounded_rectangle((x, y, x+w, y+h), radius=18, fill=f"#{fc}", outline=f"#{NAVY}", width=4)
        _center_text(draw, (x+w/2, y+h*0.38), title, head_font, f"#{NAVY}")
        _center_text(draw, (x+w/2, y+h*0.72), subtitle, body_font, f"#{MUTED}")

    box(55, 330, 350, 200, "UniFi Network", "Connected clients\nClosed sessions", LIGHT_BLUE)
    box(535, 330, 410, 200, "Sync workers", "Current sync\nHistory reconciliation", "EAF2F8")
    box(1085, 160, 370, 170, "Redis", "Live state, baseline, lock", LIGHT_GOLD)
    box(1085, 365, 370, 170, "PostgreSQL", "Authorization, session, ledger", LIGHT_GREEN)
    box(1085, 570, 370, 170, "Observability", "Checkpoint, metrics, alert", LIGHT_GRAY)
    box(1680, 330, 430, 200, "User Session API", "Current, history, daily usage", "F3EAF8")
    _arrow(draw, (405, 430), (535, 430)); _center_text(draw, (470, 390), "poll theo site", label_font, f"#{MUTED}")
    _arrow(draw, (945, 385), (1085, 250))
    _arrow(draw, (945, 430), (1085, 450))
    _arrow(draw, (945, 475), (1085, 650))
    _arrow(draw, (1455, 450), (1680, 430)); _center_text(draw, (1570, 390), "read model", label_font, f"#{MUTED}")
    image.save(path)


def draw_state_machine(path: Path):
    image = Image.new("RGB", (2200, 820), "white")
    draw = ImageDraw.Draw(image)
    title_font = _font(42, True)
    state_font = _font(31, True)
    label_font = _font(21)
    _center_text(draw, (1100, 65), "VÒNG ĐỜI SESSION", title_font, f"#{NAVY}")

    boxes = {
        "ACTIVE": (90, 280, 410, 430, LIGHT_GREEN),
        "MISSING_PENDING": (690, 280, 1230, 430, LIGHT_GOLD),
        "FINALIZED": (1590, 280, 2020, 430, LIGHT_BLUE),
        "ORPHANED": (690, 590, 1230, 740, LIGHT_RED),
    }
    for name, (x1, y1, x2, y2, fc) in boxes.items():
        draw.rounded_rectangle((x1, y1, x2, y2), radius=18, fill=f"#{fc}", outline=f"#{NAVY}", width=4)
        _center_text(draw, ((x1+x2)/2, (y1+y2)/2), name, state_font, f"#{NAVY}")

    _arrow(draw, (500, 355), (690, 355)); _center_text(draw, (595, 315), "vắng sau poll", label_font, f"#{MUTED}")
    _arrow(draw, (1230, 355), (1590, 355)); _center_text(draw, (1410, 315), "history đã chốt", label_font, f"#{MUTED}")
    _arrow(draw, (960, 430), (960, 590)); _center_text(draw, (1080, 510), "quá timeout", label_font, f"#{MUTED}")
    _arrow(draw, (1230, 665), (1590, 430)); _center_text(draw, (1450, 600), "deep reconciliation", label_font, f"#{MUTED}")
    # return path shown above the main row
    draw.line([(690, 280), (690, 190), (295, 190), (295, 280)], fill=f"#{BLUE}", width=5)
    _arrow(draw, (690, 190), (295, 190)); _center_text(draw, (495, 155), "xuất hiện lại", label_font, f"#{MUTED}")
    image.save(path)


def draw_sync_flow(path: Path):
    image = Image.new("RGB", (2200, 980), "white")
    draw = ImageDraw.Draw(image)
    title_font = _font(42, True)
    num_font = _font(30, True)
    head_font = _font(27, True)
    body_font = _font(21)
    _center_text(draw, (1100, 62), "CURRENT SESSION SYNC", title_font, f"#{NAVY}")
    steps = [
        (55, "1", "Lấy snapshot", "Một request/pagination\ncho toàn site"),
        (485, "2", "Chuẩn hóa", "MAC, timestamp, byte\nkiểm tra schema"),
        (915, "3", "Ghép authorization", "Site + MAC +\nkhoảng hiệu lực"),
        (1345, "4", "Xử lý session", "Key, last-seen, counter\ndiscontinuity"),
        (1775, "5", "Commit batch", "CAS/upsert + checkpoint\ntrong transaction"),
    ]
    for x, n, title, sub in steps:
        draw.rounded_rectangle((x, 250, x+370, 490), radius=18, fill=f"#{LIGHT_BLUE}", outline=f"#{NAVY}", width=4)
        draw.text((x+22, 270), n, font=num_font, fill=f"#{BLUE}")
        _center_text(draw, (x+185, 350), title, head_font, f"#{NAVY}")
        _center_text(draw, (x+185, 430), sub, body_font, f"#{MUTED}")
    for i in range(len(steps)-1):
        _arrow(draw, (steps[i][0]+370, 370), (steps[i+1][0], 370))
    draw.rounded_rectangle((340, 650, 1860, 870), radius=18, fill="#F8FAFC", outline=f"#{BORDER}", width=4)
    _center_text(draw, (1100, 700), "BA BẤT BIẾN CẦN GIỮ", head_font, f"#{NAVY}")
    _center_text(draw, (1100, 775), "Không gán lại user sau khi session đã snapshot\nKhông lùi baseline theo sample cũ  •  Không tiến checkpoint trước khi commit", body_font, f"#{INK}")
    image.save(path)


def configure_document(doc: Document):
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.25)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    section.header_distance = Inches(0.35)
    section.footer_distance = Inches(0.30)
    doc.settings.odd_and_even_pages_header_footer = False
    section.different_first_page_header_footer = False

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal.font.size = Pt(10.4)
    normal.font.color.rgb = rgb(INK)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25
    normal.paragraph_format.widow_control = True

    for level, size, color, before, after in [
        (1, 16, BLUE, 18, 8),
        (2, 13, BLUE, 14, 7),
        (3, 11.5, DARK_BLUE, 10, 5),
    ]:
        style = styles[f"Heading {level}"]
        style.font.name = "Calibri"
        style._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        style._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = rgb(color)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.page_break_before = False

    def configure_footer(footer):
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        fp.paragraph_format.space_before = Pt(0)
        fr = fp.add_run("Trang ")
        set_font(fr, size=9, color=MUTED)
        add_field(fp, "PAGE")

    configure_footer(section.footer)


def build_document():
    arch = ASSET_DIR / "architecture.png"
    state = ASSET_DIR / "session_state_machine.png"
    flow = ASSET_DIR / "current_sync_flow.png"
    draw_architecture(arch)
    draw_state_machine(state)
    draw_sync_flow(flow)

    doc = Document()
    configure_document(doc)
    bullet_id = add_numbering_definition(doc, bullet=True)
    decimal_id = add_numbering_definition(doc, bullet=False)
    current_decimal_id = add_numbering_definition(doc, bullet=False)

    # Opening block: memo_masthead, without decorative bottom border.
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("TÀI LIỆU THIẾT KẾ KỸ THUẬT")
    set_font(r, size=10, bold=True, color=BLUE)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("GIẢI PHÁP ĐỒNG BỘ SESSION & ACCOUNTING")
    set_font(r, size=23, bold=True, color=NAVY)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("Captive Portal WiFi UniFi - Đại học")
    set_font(r, size=14, color=MUTED)

    metadata = [
        ("Hệ thống", "HCMUS WiFi Management"),
        ("Phiên bản", "2.0 - Thiết kế đề xuất"),
        ("Ngày cập nhật", "07/08/2026"),
        ("Đối tượng", "Backend, Platform/Network, Database, QA, Security"),
        ("Trạng thái", "Sẵn sàng cho review kiến trúc và contract test UniFi"),
    ]
    for label, value in metadata:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r1 = p.add_run(f"{label}: ")
        set_font(r1, size=10.2, bold=True, color=NAVY)
        r2 = p.add_run(value)
        set_font(r2, size=10.2, color=INK)

    doc.add_paragraph()
    add_callout(
        doc,
        "Quyết định kiến trúc",
        "Session phải được gán cho user theo lần đăng nhập/authorize, không theo chủ sở hữu MAC hiện tại. "
        "Dữ liệu live là tạm tính; dữ liệu closed-session dùng để chốt và reconcile. Mọi job phải idempotent, "
        "có checkpoint bền vững và không được làm mất session khi worker hoặc Controller gián đoạn.",
        fill=LIGHT_BLUE,
        accent=BLUE,
    )
    doc.add_page_break()

    add_heading(doc, "1. Mục đích và phạm vi", 1)
    add_body(doc, "Tài liệu mô tả kiến trúc đồng bộ phiên truy cập WiFi và kiểm toán lưu lượng giữa backend HCMUS WiFi Management với UniFi Network Controller. Giải pháp phục vụ màn hình phiên hiện tại, lịch sử phiên, báo cáo lưu lượng và hạn ngạch theo ngày cho trường hợp một user sử dụng nhiều thiết bị đồng thời.")
    add_heading(doc, "1.1. Mục tiêu", 2)
    for item in [
        "Xác định đúng các session đang hoạt động với độ trễ có thể đo lường.",
        "Gán đúng từng session cho user đã thực hiện captive-portal authorization.",
        "Lưu lịch sử session đã đóng không trùng, có khả năng phục hồi khi job hoặc Controller gián đoạn.",
        "Tổng hợp lưu lượng của nhiều thiết bị theo user mà không cộng trùng dữ liệu live và finalized.",
        "Hỗ trợ MAC randomization, thiết bị dùng chung, roaming và reconnect.",
        "Cho phép audit: truy vết được dữ liệu nguồn, thời điểm quan sát và lần reconcile.",
    ]:
        add_list_item(doc, item, bullet_id)

    add_heading(doc, "1.2. Ngoài phạm vi", 2)
    for item in [
        "Nhận diện chắc chắn cùng một thiết bị vật lý qua nhiều MAC riêng tư khác nhau.",
        "Thay thế cơ chế xác thực người dùng bằng MAC address.",
        "Cam kết độ chính xác kế toán tài chính nếu chưa hoàn tất contract test trên đúng phiên bản UniFi đang vận hành.",
    ]:
        add_list_item(doc, item, bullet_id)

    add_heading(doc, "2. Quyết định thiết kế cốt lõi", 1)
    decisions = [
        ["D-01", "Tách live/final", "Connected-client snapshot dùng cho current state; closed-session dùng để chốt và reconcile."],
        ["D-02", "Batch theo site", "Lấy dữ liệu theo site và xử lý trong bộ nhớ; luôn hỗ trợ pagination nếu API có."],
        ["D-03", "Authorization snapshot", "Session lưu user_id_snapshot và authorization_id tại thời điểm ghép; không suy lại owner sau này."],
        ["D-04", "Session key có scope", "Ưu tiên controller_session_id; fallback controller_id + site_id + normalized_mac + assoc_at."],
        ["D-05", "Idempotent và recoverable", "Upsert, checkpoint sau commit, overlap window và deep reconciliation."],
        ["D-06", "Quota không double count", "Mỗi byte chỉ ở live-unsettled hoặc finalized/ledger, không đồng thời ở cả hai."],
    ]
    add_table(doc, ["ID", "Quyết định", "Nội dung"], decisions, [900, 1900, 6560])

    add_heading(doc, "3. Nguồn dữ liệu UniFi và giả định tương thích", 1)
    add_body(doc, "UniFi tồn tại nhiều thế hệ API. Các endpoint dạng /api/s/{site}/stat/* thường được dùng trong triển khai legacy, còn Local Network API hiện đại dùng /v1/sites/{siteId}/clients và clientId cho thao tác authorize. Tài liệu này mô tả contract logic; adapter UniFi phải che giấu khác biệt đường dẫn, authentication, pagination và schema giữa các phiên bản.")
    source_rows = [
        ["Connected clients", "Thiết bị hiện đang xuất hiện trong snapshot", "Current session, last-seen, live bytes", "Không dùng việc biến mất một lần để kết luận disconnect"],
        ["Closed sessions", "Session đã được Controller tổng kết", "Final bytes, end time, terminate cause", "Có độ trễ; phải overlap và reconcile"],
        ["Portal authorization", "Lần user đăng nhập và backend authorize client", "Gán user, thời hạn, quota/policy", "Nguồn danh tính nghiệp vụ"],
    ]
    add_table(doc, ["Nguồn", "Ý nghĩa", "Mục đích", "Ràng buộc"], source_rows, [1700, 2350, 2250, 3060])
    add_callout(doc, "Điều kiện bắt buộc", "Không đưa hệ thống vào production trước khi xác nhận trên đúng Controller: đơn vị và hướng rx/tx, độ phân giải assoc_time, hành vi roaming, độ trễ history, pagination, retention và ảnh hưởng của Controller restart.", fill=LIGHT_GOLD, accent="9A6A00")

    add_heading(doc, "4. Kiến trúc tổng thể", 1)
    add_body(doc, "Mỗi site có hai luồng đồng bộ độc lập: current sync chạy chu kỳ ngắn và history reconciliation chạy chu kỳ dài hơn. Redis tối ưu trạng thái live; PostgreSQL giữ các fact cần audit và phục hồi. User Session API chỉ đọc read model đã được chuẩn hóa, không gọi UniFi trực tiếp trong request của người dùng.")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(str(arch), width=Inches(6.45))
    add_caption(doc, "Hình 1 - Kiến trúc logical của hệ thống đồng bộ")

    add_heading(doc, "4.1. Thành phần", 2)
    components = [
        ["UniFi adapter", "Chuẩn hóa API legacy/modern, auth, pagination, timeout và schema."],
        ["Current sync worker", "Poll connected clients, ghép authorization, cập nhật trạng thái ACTIVE/MISSING_PENDING."],
        ["History reconciliation worker", "Quét closed sessions, upsert, finalize và điều chỉnh usage."],
        ["Redis", "Live state, baseline theo session key, distributed lock/fencing token."],
        ["PostgreSQL", "Authorization, network session, checkpoint, usage ledger và raw payload cần audit."],
        ["User Session API", "Cung cấp current, history, daily usage và logout cho frontend."],
    ]
    add_table(doc, ["Thành phần", "Trách nhiệm"], components, [2400, 6960])

    add_heading(doc, "5. Mô hình danh tính và MAC randomization", 1)
    add_body(doc, "MAC address là thuộc tính kết nối, không phải danh tính user và không phải bằng chứng sở hữu thiết bị. Mỗi MAC mới được ghi như một device identity riêng. Quan hệ user-session được xác định bởi portal authorization đang hiệu lực tại thời điểm kết nối/authorize.")
    add_heading(doc, "5.1. Quy tắc gán user", 2)
    for item in [
        "Khi user đăng nhập portal, tạo portal_authorization trước hoặc cùng transaction nghiệp vụ với thao tác authorize UniFi.",
        "Lưu controller_id, site_id, normalized_mac, controller_client_id, user_id, authorized_at và expires_at.",
        "Khi tạo network_session, ghép authorization theo cùng site + MAC và khoảng thời gian hiệu lực; snapshot user_id vào session.",
        "Nếu không có authorization hợp lệ, session ở trạng thái UNATTRIBUTED và được đưa vào hàng đợi reconciliation; không tự gán theo owner hiện tại.",
        "Khi một thiết bị được user khác sử dụng, authorization mới không sửa user_id của session cũ.",
    ]:
        add_list_item(doc, item, decimal_id)
    add_callout(doc, "MAC randomization", "Thiết kế này vẫn tính đúng lưu lượng sau khi user đăng nhập với MAC mới, nhưng không khẳng định hai MAC thuộc cùng một thiết bị vật lý. Nếu cần device trust lâu dài, phải dùng thêm certificate, MDM, Passpoint/802.1X hoặc định danh ứng dụng.", fill=LIGHT_GRAY, accent=MUTED)

    add_heading(doc, "6. Định danh và vòng đời session", 1)
    add_heading(doc, "6.1. Session key", 2)
    add_body(doc, "Khóa ưu tiên là controller_session_id nếu ID này tồn tại và ổn định giữa current/history. Khóa fallback phải có phạm vi Controller và site:")
    add_code_block(doc, "session_key = (controller_id, site_id, normalized_mac, assoc_at_utc)\n\nUNIQUE (controller_id, site_id, normalized_mac, assoc_at_utc)")
    add_body(doc, "Không đưa AP MAC vào khóa mặc định vì roaming có thể làm thay đổi AP trong cùng một phiên logic. Nếu contract test cho thấy assoc_at thay đổi khi roaming, adapter phải có quy tắc merge riêng.")

    add_heading(doc, "6.2. Trạng thái", 2)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(str(state), width=Inches(6.45))
    add_caption(doc, "Hình 2 - State machine của network session")
    state_rows = [
        ["ACTIVE", "Xuất hiện trong connected-client snapshot gần nhất."],
        ["MISSING_PENDING", "Tạm vắng sau một hoặc nhiều poll thành công; chưa đủ bằng chứng để finalize."],
        ["FINALIZED", "Đã ghép closed-session và chốt số liệu cuối cùng."],
        ["ORPHANED", "Vắng quá timeout nhưng chưa tìm thấy history; tiếp tục deep reconciliation."],
        ["UNATTRIBUTED", "Có session nhưng chưa ghép được authorization/user hợp lệ."],
    ]
    add_table(doc, ["Trạng thái", "Ý nghĩa"], state_rows, [2100, 7260])

    add_heading(doc, "7. Đồng bộ current session", 1)
    add_body(doc, "Current sync chạy theo site, ví dụ mỗi 15-30 giây tùy quy mô và giới hạn Controller. Độ trễ hiển thị tối đa xấp xỉ chu kỳ poll cộng độ trễ cập nhật của Controller; đây là near-real-time, không phải real-time tuyệt đối.")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(str(flow), width=Inches(6.45))
    add_caption(doc, "Hình 3 - Quy trình current-session sync theo batch")

    add_heading(doc, "7.1. Thuật toán", 2)
    current_steps = [
        "Giành distributed lock theo controller_id + site_id + current-stream; dùng fencing token để worker cũ không ghi đè worker mới.",
        "Gọi connected-client API với timeout, retry có jitter và pagination. Phân biệt request lỗi với response thành công nhưng rỗng.",
        "Chuẩn hóa MAC, timestamp UTC, kiểu số BIGINT, SSID, AP, IP và các counter.",
        "Tạo session key và ghép portal_authorization đang hiệu lực. Snapshot authorization_id và user_id vào session mới.",
        "Chỉ cập nhật baseline nếu observed_at mới hơn mẫu đã lưu. Upsert current state bằng compare-and-set hoặc transaction nguyên tử.",
        "Với session từng ACTIVE nhưng không xuất hiện, chuyển MISSING_PENDING sau poll thành công; không finalize trực tiếp.",
        "Commit session state, job-run metadata và checkpoint logic; phát metrics sau khi commit thành công.",
    ]
    for item in current_steps:
        add_list_item(doc, item, current_decimal_id)

    add_heading(doc, "7.2. Counter và delta", 2)
    add_body(doc, "Baseline phải được key theo session, không chỉ theo MAC. Khi session key mới, current total là số tạm tính kể từ assoc_at. Khi cùng key và sample mới hơn, delta là phần tăng giữa hai mẫu.")
    add_code_block(doc, "if new_session_key:\n    live_total = current_counter\n    baseline = current_counter\nelif observed_at <= previous_observed_at:\n    ignore_stale_sample\nelif current_counter >= baseline:\n    delta = current_counter - baseline\n    baseline = current_counter\nelse:\n    mark COUNTER_DISCONTINUITY\n    do not assume reconnect without evidence")
    add_callout(doc, "Không dùng delta = current một cách mù", "current < baseline có thể do sample đến sai thứ tự, worker chạy chồng, Controller restart hoặc schema thay đổi. Reconnect bình thường phải tạo session key mới; trường hợp bất thường cần reconcile bằng closed-session.", fill=LIGHT_RED, accent="9B1C1C")

    add_heading(doc, "8. Đồng bộ session history", 1)
    add_body(doc, "History worker là luồng chốt số liệu và phục hồi. Job không phụ thuộc vào việc current worker đã quan sát được session trước đó; một closed-session hợp lệ có thể tạo và finalize network_session trực tiếp.")
    add_heading(doc, "8.1. Cửa sổ quét", 2)
    add_code_block(doc, "query_from = last_committed_watermark - safety_overlap\nquery_to   = now - controller_settlement_delay\n\nChỉ cập nhật watermark sau khi toàn bộ trang dữ liệu và transaction đã commit.")
    for item in [
        "Safety overlap xử lý record đến trễ và job chạy sát ranh giới thời gian.",
        "Deep reconciliation quét lại 24-72 giờ theo lịch để sửa dữ liệu đến rất trễ hoặc phục hồi sau downtime.",
        "Nếu API không hỗ trợ time filter, phải paginate đến hết và giám sát retention/record limit.",
        "Upsert có điều kiện: chỉ thay số liệu final khi revision mới hơn hoặc dữ liệu hoàn thiện hơn.",
        "Session không ghép được authorization được lưu UNATTRIBUTED để điều tra, không bị bỏ qua.",
    ]:
        add_list_item(doc, item, bullet_id)

    add_heading(doc, "8.2. Tính idempotent", 2)
    add_body(doc, "Unique key chống tạo trùng network_session, nhưng mọi side effect cũng phải idempotent. Không được vừa ON CONFLICT session vừa cộng nguyên final_total vào usage_daily ở mỗi lần quét.")
    add_code_block(doc, "final_adjustment = controller_final_total - previously_accounted_total\n\nApply adjustment exactly once with a unique ledger key:\n(session_id, 'FINAL_RECONCILIATION', source_revision)")

    add_heading(doc, "9. Accounting và quota", 1)
    add_heading(doc, "9.1. Hai mức yêu cầu", 2)
    accounting_rows = [
        ["Dashboard / báo cáo cuối phiên", "Finalized session totals", "Đơn giản, eventual consistency", "Không phân bổ chính xác session qua nửa đêm"],
        ["Quota ngày gần thời gian thực", "Usage ledger theo delta + final reconciliation", "Chính xác hơn theo bucket ngày", "Nhiều write hơn; cần CAS/idempotency"],
    ]
    add_table(doc, ["Mức", "Nguồn", "Ưu điểm", "Hạn chế"], accounting_rows, [1900, 2250, 2300, 2910])

    add_heading(doc, "9.2. Công thức không double count", 2)
    add_body(doc, "Tại một thời điểm, usage của một session phải nằm ở đúng một miền: live-unsettled hoặc finalized. Với quota tổng không chia ngày:")
    add_code_block(doc, "user_usage = Σ(final_total of FINALIZED sessions)\n           + Σ(live_total of non-finalized sessions)")
    add_body(doc, "Khi closed-session xuất hiện, hệ thống thay live total bằng final total trong cùng transaction/read model. Không cộng thêm final total lên trên live total.")

    add_heading(doc, "9.3. Session đi qua nửa đêm", 2)
    add_body(doc, "Nếu quota được định nghĩa theo ngày Asia/Ho_Chi_Minh, session 23:50-00:30 phải được chia theo traffic thực tế của từng khoảng. Chỉ final total không đủ để phân bổ chính xác. Khi đó cần usage_ledger lưu delta vào bucket ngày tại thời điểm quan sát, sau đó ghi final adjustment khi session chốt.")
    add_callout(doc, "Quyết định nghiệp vụ cần chốt", "Nếu không triển khai ledger, phải ghi rõ usage_daily được quy về ngày session kết thúc. Không được mô tả kết quả đó là lưu lượng phát sinh chính xác trong từng ngày.", fill=LIGHT_GOLD, accent="9A6A00")

    add_heading(doc, "10. Thiết kế cơ sở dữ liệu", 1)
    entity_rows = [
        ["devices", "Danh mục MAC đã quan sát", "normalized_mac, first_seen_at, last_seen_at"],
        ["portal_authorizations", "Lần user đăng nhập và authorize client", "site_id, user_id, device_id, client_id, authorized_at, expires_at"],
        ["network_sessions", "Fact session live và finalized", "session key, user snapshot, state, live/final bytes, timestamps"],
        ["usage_ledger", "Delta và adjustment bất biến", "session_id, bucket_date, rx_delta, tx_delta, event_type, idempotency_key"],
        ["sync_checkpoints", "Watermark bền vững theo stream/site", "watermark, last_success_at, status"],
        ["sync_job_runs", "Audit từng lần chạy", "started_at, completed_at, counts, error, fencing_token"],
    ]
    add_table(doc, ["Bảng", "Mục đích", "Trường trọng yếu"], entity_rows, [2000, 3000, 4360])

    add_heading(doc, "10.1. network_sessions đề xuất", 2)
    add_code_block(doc, "network_sessions (\n  id UUID PRIMARY KEY,\n  controller_id UUID NOT NULL,\n  site_id VARCHAR NOT NULL,\n  controller_session_id VARCHAR NULL,\n  device_id UUID NOT NULL,\n  authorization_id UUID NULL,\n  user_id_snapshot UUID NULL,\n  normalized_mac VARCHAR(12) NOT NULL,\n  assoc_at TIMESTAMPTZ NOT NULL,\n  disconnected_at TIMESTAMPTZ NULL,\n  status VARCHAR NOT NULL,\n  live_download_bytes BIGINT NOT NULL DEFAULT 0,\n  live_upload_bytes BIGINT NOT NULL DEFAULT 0,\n  final_download_bytes BIGINT NULL,\n  final_upload_bytes BIGINT NULL,\n  last_seen_at TIMESTAMPTZ NULL,\n  finalized_at TIMESTAMPTZ NULL,\n  source_revision VARCHAR NULL,\n  raw_payload JSONB NULL,\n  UNIQUE(controller_id, site_id, normalized_mac, assoc_at)\n)")

    add_heading(doc, "10.2. Ràng buộc dữ liệu", 2)
    for item in [
        "Byte counter và duration không âm; lưu bằng BIGINT.",
        "finalized_at chỉ có khi trạng thái FINALIZED.",
        "user_id_snapshot không thay đổi sau khi session đã được gán, trừ quy trình sửa sai có audit.",
        "Mỗi ledger event có idempotency_key duy nhất.",
        "Mọi timestamp lưu UTC; bucket_date tính theo timezone policy được cấu hình, mặc định Asia/Ho_Chi_Minh.",
        "MAC lưu canonical 12 ký tự hex hoặc kiểu chuyên biệt; định dạng có dấu chỉ tạo khi hiển thị.",
    ]:
        add_list_item(doc, item, bullet_id)

    add_heading(doc, "11. Tính đồng thời và khả năng phục hồi", 1)
    reliability_rows = [
        ["Hai worker chạy cùng site", "Distributed lock + fencing token; DB từ chối token cũ."],
        ["Worker chết sau fetch", "Không tiến checkpoint; lần sau quét lại và upsert idempotent."],
        ["Worker chết sau commit", "Checkpoint đã nằm cùng transaction hoặc side effect có idempotency key."],
        ["Controller/API lỗi", "Giữ current state cũ, tăng staleness; không đánh dấu toàn site offline."],
        ["Response thành công nhưng rỗng bất thường", "Health guard theo biến động số client; chuyển pending thay vì finalize hàng loạt."],
        ["Redis mất baseline", "Tái dựng current total từ snapshot; không tạo delta ledger thiếu căn cứ; chờ reconcile."],
    ]
    add_table(doc, ["Tình huống", "Cách xử lý"], reliability_rows, [3100, 6260])

    add_heading(doc, "12. API phục vụ frontend", 1)
    add_body(doc, "Các endpoint hiện có của HCMUS WiFi Management có thể giữ nguyên, nhưng backend phải trả trạng thái freshness để UI phân biệt 'không có session' với 'dữ liệu tạm thời không cập nhật'.")
    api_rows = [
        ["GET", "/api/v1/user-sessions/me/current", "Danh sách session ACTIVE/MISSING_PENDING phù hợp chính sách hiển thị"],
        ["GET", "/api/v1/user-sessions/me/usage", "Usage ngày: settled, live, total, quota và asOf"],
        ["GET", "/api/v1/user-sessions/me", "Lịch sử phân trang, lọc ngày/status/SSID"],
        ["POST", "/api/v1/user-sessions/me/{id}/logout", "Ngắt một session sau khi kiểm tra ownership"],
        ["POST", "/api/v1/user-sessions/me/logout-all", "Thu hồi các authorization/session đang hoạt động của user"],
    ]
    add_table(doc, ["Method", "Endpoint", "Mục đích"], api_rows, [900, 3650, 4810])
    add_code_block(doc, '{\n  "data": {\n    "sessions": [...],\n    "freshness": {\n      "asOf": "2026-08-07T09:00:00Z",\n      "status": "FRESH",\n      "sourceLagSeconds": 12\n    }\n  }\n}')

    add_heading(doc, "13. Monitoring, bảo mật và lưu giữ dữ liệu", 1)
    add_heading(doc, "13.1. Metrics và cảnh báo", 2)
    metrics = [
        ["unifi_sync_duration_seconds", "Latency job theo site/stream"],
        ["unifi_sync_last_success_age_seconds", "Tuổi của lần sync thành công gần nhất"],
        ["connected_clients_observed", "Số client quan sát; phát hiện sụt giảm bất thường"],
        ["sessions_finalized_total", "Số session được chốt"],
        ["sessions_orphaned_total", "Session quá timeout chưa có history"],
        ["sessions_unattributed_total", "Session chưa ghép được user/authorization"],
        ["counter_discontinuity_total", "Số lần counter giảm bất thường"],
        ["reconciliation_adjustment_bytes", "Độ lệch live so với final"],
    ]
    add_table(doc, ["Metric", "Ý nghĩa"], metrics, [3900, 5460])

    add_heading(doc, "13.2. Bảo mật và riêng tư", 2)
    for item in [
        "MAC có thể là dữ liệu nhận dạng gián tiếp; áp dụng retention, phân quyền truy cập và audit log.",
        "Không tin MAC như credential vì có thể spoof; mọi API user phải kiểm tra user_id_snapshot/authorization ownership.",
        "UniFi credential/API key lưu trong secret manager, giới hạn quyền và xoay vòng định kỳ.",
        "raw_payload chỉ giữ đủ lâu để điều tra; loại bỏ trường không cần thiết và mã hóa dữ liệu nhạy cảm khi lưu.",
        "Logout/revoke phải idempotent và xác nhận trạng thái Controller sau thao tác.",
    ]:
        add_list_item(doc, item, bullet_id)

    add_heading(doc, "14. SLO đề xuất", 1)
    slo_rows = [
        ["Current-session freshness", "P95 <= 45 giây", "Tính từ thời điểm snapshot Controller đến read model"],
        ["History finalization", "P95 <= 5 phút", "Sau disconnect, phụ thuộc settlement delay"],
        ["Không trùng session", "100% theo unique key", "Bao gồm job retry và overlap"],
        ["Unattributed sessions", "< 0,1%/ngày", "Phải điều tra khi vượt ngưỡng"],
        ["Orphaned sessions", "< 0,1% sau 24 giờ", "Deep reconciliation vẫn tiếp tục"],
        ["Accounting reconciliation", "Sai lệch < 0,5% tổng byte/ngày", "Ngưỡng ban đầu, hiệu chỉnh sau pilot"],
    ]
    add_table(doc, ["Chỉ tiêu", "Mục tiêu", "Ghi chú"], slo_rows, [2800, 2200, 4360])

    add_heading(doc, "15. Kế hoạch kiểm thử bắt buộc", 1)
    tests = [
        ["T-01", "Một user, nhiều thiết bị", "Hai MAC online đồng thời; tổng user bằng tổng từng session, không gộp nhầm baseline."],
        ["T-02", "MAC reconnect nhanh", "Tạo hai session riêng; không đè khóa hoặc cộng counter cũ."],
        ["T-03", "Roaming AP", "Xác định có giữ cùng session/assoc_at trên Controller thực tế."],
        ["T-04", "MAC randomization", "MAC mới tạo device mới nhưng gán đúng user sau authorization."],
        ["T-05", "Thiết bị dùng chung", "Session cũ giữ user A; authorization/session mới thuộc user B."],
        ["T-06", "Counter giảm", "Không cộng current mù; tạo discontinuity và reconcile."],
        ["T-07", "Job chạy chồng", "Một fencing token thắng; không double ledger."],
        ["T-08", "Job crash trước/sau commit", "Không mất session, không tiến checkpoint sai."],
        ["T-09", "History đến trễ", "Overlap và deep reconciliation vẫn finalize."],
        ["T-10", "Pagination/record limit", "Lấy đủ trang; cảnh báo khi response chạm giới hạn."],
        ["T-11", "Controller restart", "Không finalize hàng loạt và không tạo usage spike."],
        ["T-12", "Session qua nửa đêm", "Ledger phân bổ đúng timezone Asia/Ho_Chi_Minh."],
        ["T-13", "Hướng rx/tx", "Đối chiếu upload/download bằng traffic test có kiểm soát."],
        ["T-14", "History final khác live", "Adjustment chính xác và idempotent."],
    ]
    add_table(doc, ["ID", "Kịch bản", "Kết quả mong đợi"], tests, [800, 2400, 6160])

    add_heading(doc, "16. Lộ trình triển khai", 1)
    phases = [
        ["Giai đoạn 1 - Contract test", "Chốt phiên bản UniFi, schema, pagination, assoc_time, rx/tx, roaming, restart và retention."],
        ["Giai đoạn 2 - Shadow mode", "Chạy sync không tác động quota; so sánh UI/Controller và đo độ lệch live-final."],
        ["Giai đoạn 3 - Read model", "Cấp current/history cho frontend, bật freshness và monitoring."],
        ["Giai đoạn 4 - Accounting", "Bật finalized accounting; nếu quota ngày cần chính xác thì bật usage ledger."],
        ["Giai đoạn 5 - Enforcement", "Chỉ bật quota/logout tự động sau khi SLO và reconciliation đạt ngưỡng ổn định."],
    ]
    add_table(doc, ["Giai đoạn", "Nội dung"], phases, [2600, 6760])

    add_heading(doc, "17. Tiêu chí nghiệm thu", 1)
    for item in [
        "Đã có contract test report cho đúng UniFi Network version và loại console/gateway đang dùng.",
        "Mọi session có khóa chứa controller/site scope và MAC canonical.",
        "Session được gán bằng authorization snapshot; không join ownership hiện tại để tính lịch sử.",
        "Checkpoint chỉ tiến sau commit; retry và chạy chồng không tạo duplicate session/ledger.",
        "Frontend phân biệt empty state với stale/error state.",
        "Daily quota có định nghĩa rõ: theo ngày kết thúc hoặc theo delta ledger trong timezone policy.",
        "Dashboard vận hành có lag, orphan, unattributed và reconciliation adjustment.",
        "Toàn bộ test T-01 đến T-14 đạt trong staging và pilot site.",
    ]:
        add_list_item(doc, item, bullet_id)

    add_heading(doc, "Phụ lục A - Invariant quan trọng", 1)
    invariants = [
        ["I-01", "Một session chỉ có một user_id_snapshot sau khi đã gán."],
        ["I-02", "Một controller session/source key chỉ tạo tối đa một network_session."],
        ["I-03", "Sample cũ hơn không được làm lùi baseline hoặc last_seen_at."],
        ["I-04", "Checkpoint không vượt qua dữ liệu chưa commit."],
        ["I-05", "Một ledger idempotency_key chỉ được áp dụng một lần."],
        ["I-06", "Một byte không đồng thời nằm trong live-unsettled và finalized usage."],
        ["I-07", "API lỗi không được suy diễn thành toàn bộ client đã disconnect."],
    ]
    add_table(doc, ["ID", "Invariant"], invariants, [1100, 8260])

    add_heading(doc, "Phụ lục B - Tài liệu tham chiếu", 1)
    add_body(doc, "Các đường dẫn dưới đây dùng để xác nhận luồng API chính thức. Tài liệu Local Network API hiển thị trong chính UniFi Network > Integrations vẫn là nguồn quyết định cho phiên bản đang triển khai.")
    refs = [
        ("Ubiquiti - Getting Started with the Official UniFi API", "https://help.ui.com/hc/en-us/articles/30076656117655-Getting-Started-with-the-Official-UniFi-API"),
        ("Ubiquiti - External Hotspot API for Authorization Clients", "https://help.ui.com/hc/en-us/articles/31228198640023-External-Hotspot-API-for-Authorization-Clients"),
        ("Ubiquiti Developer - UniFi Network API", "https://developer.ui.com/network"),
    ]
    for label, url in refs:
        p = doc.add_paragraph()
        apply_numbering(p, bullet_id)
        p.paragraph_format.space_after = Pt(4)
        add_hyperlink(p, label, url)

    # Prevent Heading 1 from forcing a blank first page if it is the first heading after title.
    doc.sections[0].different_first_page_header_footer = False
    doc.core_properties.title = "Giải pháp đồng bộ Session & Accounting - Captive Portal WiFi UniFi"
    doc.core_properties.subject = "Thiết kế kỹ thuật HCMUS WiFi Management"
    doc.core_properties.author = "HCMUS WiFi Management Development Team"
    doc.core_properties.keywords = "UniFi, captive portal, session, accounting, quota, WiFi"
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build_document()
