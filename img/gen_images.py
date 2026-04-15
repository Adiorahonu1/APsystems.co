"""
Generate 5 service accordion images for AP Systems website via KIE API.
Run from any directory — paths are absolute.
"""
import os, sys, json, time, requests

API_KEY = "26a62db8d78ec6de1cfdb0d653caeaaf"
BASE_URL = "https://api.kie.ai/api/v1/jobs"
OUT_DIR  = os.path.dirname(os.path.abspath(__file__))

IMAGES = [
    {
        "filename": "svc-lead-gen.jpg",
        "aspect":   "3:4",
        "prompt": {
            "prompt": (
                "Cinematic dark tech visual. A single glowing digital funnel at center, "
                "clean minimal composition on near-black background #080808. Thin neon cyan streams "
                "(#09AFFC) flow downward into the funnel mouth, converging to a bright point at the bottom. "
                "Extremely clean negative space — no clutter, no text, no labels. "
                "Subtle depth fog. Shot at f/2.0, 85mm equivalent, ISO 200. "
                "Color palette: deep charcoal background, single cyan accent, faint blue-purple glow at edges. "
                "Mood: premium, precise, intentional. Editorial product photography aesthetic. "
                "No humans. No UI chrome. No data tables. No icons. Just the funnel and light streams. "
                "Do not add any text or overlays."
            ),
            "negative_prompt": (
                "text, labels, icons, cluttered, busy, stock photo, generic, white background, "
                "bright colors, gradients everywhere, cartoon, illustration, 3D render, plastic look, "
                "humans, faces, hands, office, multiple objects competing for attention"
            )
        }
    },
    {
        "filename": "svc-booking.jpg",
        "aspect":   "3:4",
        "prompt": {
            "prompt": (
                "Cinematic dark minimal photo. A single clean calendar grid floating on deep black background. "
                "Ultra-thin white grid lines forming a month calendar, one date cell glowing softly in cyan (#09AFFC). "
                "Extreme negative space around the calendar. Fine light rays from the glowing cell. "
                "Shot at f/1.8, 85mm, ISO 200. No clutter, no additional elements. "
                "Color: near-black background, white hairlines, single cyan glow point. "
                "Mood: precision scheduling, clean, minimal, architectural. "
                "No humans, no devices, no hands, no UI windows, no text labels. Pure geometry and light."
            ),
            "negative_prompt": (
                "text, labels, cluttered, busy, smartphone, laptop, tablet, office desk, person, "
                "multiple calendars, colorful, icons, buttons, UI elements, white background, stock photo, "
                "illustration, cartoon, 3D render, plastic, generic"
            )
        }
    },
    {
        "filename": "svc-qualify.jpg",
        "aspect":   "3:4",
        "prompt": {
            "prompt": (
                "Cinematic dark abstract. A vertical filter stack visualization on near-black background. "
                "Three horizontal translucent layers, each progressively narrower, like a sieve or strainer in profile. "
                "Tiny luminous dots (representing leads) fall from top, most blocked by layers, a few bright cyan dots "
                "pass all the way through to the bottom — clearly qualified. Extremely clean composition. "
                "Wide negative space. Cool blue-cyan palette on charcoal. "
                "85mm, f/2.0, ISO 200. Elegant, architectural, precise. "
                "No text, no labels, no percentages, no UI elements, no humans."
            ),
            "negative_prompt": (
                "text, numbers, percentages, labels, cluttered, busy, colorful pie chart, bar chart, "
                "dashboard, UI, humans, office, stock photo, white background, illustration, "
                "cartoon, 3D render, plastic, generic, icons"
            )
        }
    },
    {
        "filename": "svc-crm.jpg",
        "aspect":   "3:4",
        "prompt": (
            "Cinematic dark minimal composition. A single central node glowing cyan on deep black, "
            "with five clean hairline connections radiating outward to five smaller nodes at equal distances — "
            "like a perfect spoke wheel of light. Each connection line pulses with a slow-moving dot of light. "
            "Massive negative space. No labels, no icons, no text. Just geometry and glow. "
            "Color: #080808 background, #09AFFC cyan nodes and lines, faint purple diffusion glow. "
            "Shot at 85mm, f/1.8, ISO 200. Mood: connected systems, elegant, systematic, quiet. "
            "No humans, no phones, no email icons, no office."
        )
    },
    {
        "filename": "svc-workflow.jpg",
        "aspect":   "3:4",
        "prompt": {
            "prompt": (
                "Cinematic dark abstract. A 3x3 grid of identical glowing squares on near-black background. "
                "Thin luminous cyan connecting lines link each square to its neighbors — horizontal, vertical, diagonal — "
                "forming an elegant mesh. All squares identical size, perfectly spaced, architectural precision. "
                "One square at center slightly brighter, as if active. Clean, wide negative space around the grid. "
                "85mm, f/2.0, ISO 200. Colors: charcoal background, cyan lines and squares, minimal purple edge glow. "
                "Mood: integrated systems, order, precision, calm. "
                "No text, no logos, no labels, no humans, no UI windows, no icons."
            ),
            "negative_prompt": (
                "text, labels, logos, icons, cluttered, busy, colorful, humans, office, devices, "
                "white background, stock photo, illustration, cartoon, 3D render, plastic, generic, "
                "brand logos, software names"
            )
        }
    },
]

HEADERS = {
    "Content-Type":  "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

def create_task(prompt_obj, aspect):
    if isinstance(prompt_obj, str):
        prompt_str = prompt_obj
        neg = ""
    else:
        prompt_str = prompt_obj.get("prompt", "")
        neg        = prompt_obj.get("negative_prompt", "")

    payload = {
        "model": "nano-banana-2",
        "input": {
            "prompt":          prompt_str,
            "negative_prompt": neg,
            "aspect_ratio":    aspect,
            "resolution":      "1K",
            "output_format":   "jpg"
        }
    }
    r = requests.post(f"{BASE_URL}/createTask", headers=HEADERS, json=payload, timeout=30)
    r.raise_for_status()
    data = r.json()
    task_id = data.get("data", {}).get("taskId")
    if not task_id:
        raise ValueError(f"No taskId: {data}")
    return task_id

def poll_and_download(task_id, out_path, label):
    for attempt in range(80):
        time.sleep(5)
        r = requests.get(f"{BASE_URL}/recordInfo", headers=HEADERS,
                         params={"taskId": task_id}, timeout=15)
        r.raise_for_status()
        data = r.json().get("data", {})
        state = data.get("state", "pending")
        print(f"  [{label}] poll {attempt+1}: {state}")
        if state in ("success", "completed"):
            urls = json.loads(data.get("resultJson", "{}")).get("resultUrls", [])
            if not urls:
                raise ValueError("No URLs in result")
            img = requests.get(urls[0], timeout=60)
            img.raise_for_status()
            with open(out_path, "wb") as f:
                f.write(img.content)
            print(f"  [{label}] saved → {out_path}")
            return
        elif state in ("failed", "error"):
            raise ValueError(f"Task failed: {json.dumps(data, indent=2)}")
    raise TimeoutError(f"[{label}] timed out")

if __name__ == "__main__":
    # Submit all tasks first (parallel submission)
    tasks = []
    for img in IMAGES:
        out = os.path.join(OUT_DIR, img["filename"])
        if os.path.exists(out):
            print(f"SKIP {img['filename']} (already exists)")
            tasks.append(None)
            continue
        print(f"Submitting {img['filename']}...")
        tid = create_task(img["prompt"], img["aspect"])
        print(f"  task_id = {tid}")
        tasks.append(tid)

    # Poll each in sequence
    for img, tid in zip(IMAGES, tasks):
        if tid is None:
            continue
        out = os.path.join(OUT_DIR, img["filename"])
        poll_and_download(tid, out, img["filename"])

    print("\nAll images done.")
