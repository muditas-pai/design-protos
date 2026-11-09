"""Precompute the shared-border topology the detail slider simplifies live.

    VEC_WORK=<work> python precompute.py <name> <out_dir>

<work> is an illustration-to-vectors work folder (config.json, labels.npy, clusters.json, the reference).
Writes <out_dir>/<name>.js with three colour levels (coarse, roles, fine). Each level is a planar map:
faces (one per connected patch of one colour) and arcs (each border between two faces, stored once).
The page simplifies arcs, never faces, so neighbouring shapes always share the same edge: no gaps.
"""
import os, sys, json, base64
import numpy as np, cv2
sys.path.insert(0, os.path.expanduser("~/.claude/skills/illustration-to-vectors/scripts"))
from tools import labels, role_map, ROLE_HEX, ROLE_OF, H, W, WORK

name, out_dir = sys.argv[1], sys.argv[2]
ROLES = list(ROLE_HEX)
hex2rgb = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)

def lab(rgb):
    return cv2.cvtColor(np.uint8([[np.clip(rgb, 0, 255)]]), cv2.COLOR_RGB2LAB)[0, 0].astype(float)

# ---------------------------------------------------------------- the three colour levels
def level_fine():
    """Raw colour clusters. Colour = the cluster's own colour; role = the role it maps to."""
    L = labels(); cl = {c["k"]: c["hex"] for c in json.load(open(os.path.join(WORK, "clusters.json")))}
    ids = sorted(ROLE_OF); m = np.full(L.shape, -1, np.int16)
    for i, k in enumerate(ids): m[L == k] = i
    return m, [cl[k] for k in ids], [ROLE_OF[k] for k in ids]

def level_roles():
    m = role_map().astype(np.int16)
    return m, [ROLE_HEX[r] for r in ROLES], ROLES

def level_coarse(keep=0.55):
    """Roles merged pairwise by colour distance (within one family) until about `keep` of them remain."""
    m, hexes, names = level_roles()
    area = {i: int((m == i).sum()) for i in range(len(names))}
    groups = {i: [i] for i in range(len(names)) if area[i]}
    col = {i: hex2rgb(hexes[i]) for i in groups}
    fam = lambda i: names[i].split("/")[0] if "/" in names[i] else "dominant"
    target = max(3, round(len(groups) * keep))
    while len(groups) > target:
        best = None
        for a in groups:
            for b in groups:
                if a < b and fam(a) == fam(b):
                    d = np.linalg.norm(lab(col[a]) - lab(col[b]))
                    if best is None or d < best[0]: best = (d, a, b)
        if best is None: break
        _, a, b = best
        if area[b] > area[a]: a, b = b, a                       # a keeps its role name: the larger one
        col[a] = (col[a] * area[a] + col[b] * area[b]) / (area[a] + area[b]); area[a] += area[b]
        groups[a] += groups.pop(b)
    out = np.full(m.shape, -1, np.int16); hx, nm = [], []
    for j, (a, members) in enumerate(groups.items()):
        out[np.isin(m, members)] = j
        hx.append("#%02X%02X%02X" % tuple(int(round(v)) for v in col[a])); nm.append(names[a])
    return out, hx, nm

# ---------------------------------------------------------------- cleaning the label map
def mode_filter(m, k=5):
    """Each pixel takes the most common label in its k x k neighbourhood: speckle and jaggies out."""
    vals = np.unique(m); best = np.zeros(m.shape, np.float32) - 1; out = m.copy()
    for v in vals:
        c = cv2.boxFilter((m == v).astype(np.float32), -1, (k, k), normalize=False, borderType=cv2.BORDER_REPLICATE)
        win = c > best; out[win] = v; best[win] = c[win]
    return out

def absorb_small(m, min_px=24):
    """Patches under min_px pixels take the label of their nearest neighbour."""
    unknown = np.zeros(m.shape, bool)
    for v in np.unique(m):
        n, cc, st, _ = cv2.connectedComponentsWithStats((m == v).astype(np.uint8), connectivity=4)
        small = np.nonzero(st[1:, cv2.CC_STAT_AREA] < min_px)[0] + 1
        if len(small): unknown |= np.isin(cc, small)
    m = m.copy(); m[unknown] = -32768
    while (m == -32768).any():
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            src = np.roll(m, (dy, dx), (0, 1)); fill = (m == -32768) & (src != -32768)
            m[fill] = src[fill]
    return m

# ---------------------------------------------------------------- planar map: faces and shared arcs
def planar_map(m):
    """Faces = 4-connected patches of one label (face 0 = outside, never drawn). Arcs = maximal border runs
    between two faces, walked on the pixel-corner grid, each stored once with its left and right face."""
    R = np.zeros(m.shape, np.int32); face_label = [-1]; face_area = [0]
    for v in np.unique(m):
        if v < 0: continue
        n, cc, st, _ = cv2.connectedComponentsWithStats((m == v).astype(np.uint8), connectivity=4)
        base = len(face_label)
        R[cc > 0] = cc[cc > 0] + base - 1
        face_label += [int(v)] * (n - 1); face_area += st[1:, cv2.CC_STAT_AREA].tolist()
    Rp = np.pad(R, 1); h, w = Rp.shape
    Hd = np.zeros((h + 1, w + 1), bool); Hd[1:h, :w] = Rp[:-1, :] != Rp[1:, :]      # edge (cx,cy)->(cx+1,cy)
    Vd = np.zeros((h + 1, w + 1), bool); Vd[:h, 1:w] = Rp[:, :-1] != Rp[:, 1:]      # edge (cx,cy)->(cx,cy+1)
    deg = Hd.astype(np.int8).copy(); deg[:, 1:] += Hd[:, :-1]; deg += Vd; deg[1:, :] += Vd[:-1, :]
    Hv = np.zeros_like(Hd); Vv = np.zeros_like(Vd)

    def steps(cx, cy):          # unvisited boundary edges out of a corner: (dx, dy)
        out = []
        if Hd[cy, cx] and not Hv[cy, cx]: out.append((1, 0))
        if cx > 0 and Hd[cy, cx - 1] and not Hv[cy, cx - 1]: out.append((-1, 0))
        if Vd[cy, cx] and not Vv[cy, cx]: out.append((0, 1))
        if cy > 0 and Vd[cy - 1, cx] and not Vv[cy - 1, cx]: out.append((0, -1))
        return out
    def visit(cx, cy, dx, dy):
        if dx == 1: Hv[cy, cx] = True
        elif dx == -1: Hv[cy, cx - 1] = True
        elif dy == 1: Vv[cy, cx] = True
        else: Vv[cy - 1, cx] = True
    def left_right(cx, cy, dx, dy):   # y-down: facing east, left is north
        if dx == 1: return Rp[cy - 1, cx], Rp[cy, cx]
        if dx == -1: return Rp[cy, cx - 1], Rp[cy - 1, cx - 1]
        if dy == 1: return Rp[cy, cx], Rp[cy, cx - 1]
        return Rp[cy - 1, cx - 1], Rp[cy - 1, cx]

    arcs = []
    def walk(cx, cy, dx, dy, closed):
        l, r = left_right(cx, cy, dx, dy); pts = [(cx, cy)]; sx, sy = cx, cy
        while True:
            visit(cx, cy, dx, dy); cx += dx; cy += dy; pts.append((cx, cy))
            if (cx, cy) == (sx, sy) and closed: break
            if not closed and deg[cy, cx] != 2: break
            nxt = steps(cx, cy)
            if not nxt: break
            dx, dy = nxt[0]
        arcs.append((int(l), int(r), pts, closed))
    ys, xs = np.nonzero(deg >= 3)
    for cy, cx in zip(ys, xs):
        for dx, dy in steps(cx, cy): walk(cx, cy, dx, dy, False)
    for edges, horiz in ((Hd, True), (Vd, False)):        # islands: loops with no junction on them
        ys, xs = np.nonzero(edges & ~(Hv if horiz else Vv))
        for cy, cx in zip(ys, xs):
            if (Hv if horiz else Vv)[cy, cx]: continue
            walk(cx, cy, *((1, 0) if horiz else (0, 1)), True)
    return face_label, face_area, arcs

def smooth(pts, closed, win=5):
    """Pixel staircase -> smooth polyline (moving average). Junction endpoints stay exactly where they are."""
    P = np.array(pts, float) - 1.0          # padded corner coords -> image coords
    n = len(P)
    if n < 4: return P
    k = win // 2
    if closed:
        Q = np.vstack([P[-k - 1:-1], P[:-1], P[1:k + 1]]); S = np.array([Q[i:i + win].mean(0) for i in range(n - 1)])
        return np.vstack([S, S[:1]])
    S = P.copy()
    for i in range(1, n - 1):
        a, b = max(0, i - k), min(n, i + k + 1); S[i] = P[a:b].mean(0)
    return S

def dp(P, eps):
    """Douglas-Peucker, endpoints kept."""
    if len(P) < 3: return P
    keep = np.zeros(len(P), bool); keep[0] = keep[-1] = True; stack = [(0, len(P) - 1)]
    while stack:
        a, b = stack.pop(); seg = P[b] - P[a]; L = np.hypot(*seg)
        idx = np.arange(a + 1, b)
        if not len(idx): continue
        V = P[idx] - P[a]; d = np.abs(seg[0] * V[:, 1] - seg[1] * V[:, 0]) / L if L else np.hypot(*(P[idx] - P[a]).T)
        j = int(d.argmax())
        if d[j] > eps: keep[idx[j]] = True; stack += [(a, idx[j]), (idx[j], b)]
    return P[keep]

def build(level_fn):
    raw, hexes, names = level_fn()
    m = absorb_small(mode_filter(raw.copy(), 3), 16)
    face_label, face_area, arcs = planar_map(m)
    A = []
    for l, r, pts, closed in arcs:
        P = dp(smooth(pts, closed), 0.25)
        A.append([l, r, 1 if closed else 0, (np.round(P * 10).astype(int)).ravel().tolist()])
    # the reference at quarter size, as colour index + 1 (0 = outside), for the live match score
    q = cv2.resize((raw + 1).astype(np.uint8), (W // 4, H // 4), interpolation=cv2.INTER_NEAREST)
    return {"colours": hexes, "roles": names, "faces": [[fl, fa] for fl, fa in zip(face_label, face_area)], "arcs": A,
            "ref": {"w": int(q.shape[1]), "h": int(q.shape[0]), "b64": base64.b64encode(q.tobytes()).decode()}}

out = {"name": name, "w": W, "h": H, "levels": {}}
for key, fn in (("coarse", level_coarse), ("roles", level_roles), ("fine", level_fine)):
    out["levels"][key] = build(fn)
    lv = out["levels"][key]; print(key, "colours", len(lv["colours"]), "faces", len(lv["faces"]) - 1, "arcs", len(lv["arcs"]),
                                   "points", sum(len(a[3]) // 2 for a in lv["arcs"]))
# a .js file, not .json: a <script> tag loads it from Finder (file://), where fetch() is blocked
path = os.path.join(out_dir, f"{name}.js")
open(path, "w").write("(window.VDS_DATA = window.VDS_DATA || {})[%s] = %s;\n" % (json.dumps(name), json.dumps(out, separators=(",", ":"))))
print(path, os.path.getsize(path) // 1024, "KB")
