# Avatar photos

**These are supplied and live.** Eight portraits, downsized from the originals in
`../../assets/avatars/` — 2–3 MB each there, ~85 KB each here, because the largest
place one is ever drawn is 56 px and this deck opens by double-click from a USB
stick. Regenerate with `scratchpad/resize_avatars.js` if the sources change.

They are **transparent cutouts**, so `.pav-i` in `styles.css` paints a pale accent
wash behind each one. That is what gives a photo the same disc an initials orb
has, and it is why a row of people reads as one set whether or not a picture
exists. The signed-in user's tile in the sidebar takes the same wash.

## Who is who

**One given name each, and it is exactly the filename.** No surnames: the
datasets originally wrote owners short-form (`S. Menon`, `A. Iyer`), and welding
a supplied first name onto an invented surname put an invented identity on a real
person's face. A name here is whatever the file is called, so the roster, the
folder and the data cannot drift apart.

| File | Name in the mock-up | Source file | Was |
|---|---|---|---|
| `lohith-s.png` | **Lohith S** | `lohith.png` | — the signed-in user, in the sidebar profile row. Not a dataset owner, and the one name that keeps its initial: it is the account's own, and it matches `lohith.s@crozaint.com`. |
| `irfan.png` | **Irfan** | `irfan.png` | `I. Sheikh` |
| `sujeev.png` | **Sujeev** | `sujeev.png` | `S. Menon` |
| `nidhish.png` | **Nidhish** | `nidhish.png` | `N. Rao` |
| `rohit.png` | **Rohit** | `rohit.png` | `R. Kadavan` |
| `kezia.png` | **Kezia** | `kezia.png` | `G. Prasad` |
| `erin.png` | **Erin** | `team-image-1.png` | `A. Iyer` — **stock photo** |
| `daniel.png` | **Daniel** | `team-image-2.png` | `L. Kumar` — **stock photo** |

Six of the eight are named people. **Two are stock**, and they take Western given
names because that is what the portraits depict — an Indian surname on either
would have been the same mismatch in the other direction. Rename them freely:
change the name in the six `data/scenario-*.js` files, in `PERSON_TONE` in
`../people.js`, and rename the file here to match the new slug.

## Adding or replacing one

Drop `<slug>.png` in and it appears everywhere that person's name appears — the
slug is the name lowercased with each run of non-alphanumerics replaced by a
single `-`. `.png` is tried first and `.jpg` second; PNG leads because these are
cutouts and only PNG carries transparency.

- **Square**, 256 × 256 is plenty. Non-square is centre-cropped, so a portrait
  loses its top and bottom.
- Head and shoulders, face roughly centred. It is masked to a circle and nudged
  up slightly so the face sits on the disc's optical centre.
- Keep each file under ~100 KB.
- To reserve a colour rather than let the hash pick one, add a line to
  `PERSON_TONE` in `../people.js`.

## Who must never get a photo

`"Unassigned"` — the Unallocated cost centre's owner. The point of that row is
that nobody owns it, and it renders an empty disc that holds the column's x.

Also not people, despite looking like names: the five products (Product Alpha …
Epsilon), the nine departments, the vendors and applications (Grafana Labs,
Claude Enterprise, Miro Business …) and the fictional client companies
(Northwind Systems, Halyard Digital, Cortelle Group, Vantiq Labs).
