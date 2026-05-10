#!/usr/bin/env python3
import json, os, sys

MAP = {
    "index.html":    "ru-accueil.html",
    "histoire.html": "istoriya.html",
    "offices.html":  "bogoslujeniya.html",
    "dons.html":     "pozhertvovaniya.html",
    "contact.html":  "kontakty.html",
}

try:
    payload = json.load(sys.stdin)
except Exception:
    sys.exit(0)

fp = (payload.get("tool_input") or {}).get("file_path") or ""
fr = os.path.basename(fp)
ru = MAP.get(fr)
if not ru:
    sys.exit(0)

msg = (
    f"FR_TO_RU_SYNC: Le fichier FR {fr} vient d'etre modifie. "
    f"Tu dois maintenant mettre a jour {ru} pour refleter EXACTEMENT les memes "
    "changements de structure DOM, classes CSS, ordre des sections, attributs, "
    "et liens (en gardant les liens RU comme istoriya.html, bogoslujeniya.html, "
    "pozhertvovaniya.html, kontakty.html, ru-accueil.html). Traduis uniquement "
    "le contenu textuel en russe. Ne touche pas au design, aux classes, aux styles, "
    "ni a la structure. Lis les deux fichiers, applique le diff structurel, conserve "
    "les traductions russes existantes pour les passages inchanges."
)

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": msg,
    }
}))