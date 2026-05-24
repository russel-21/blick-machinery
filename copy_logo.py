import shutil
import os

src = r"C:\Users\SOLUTIONSµ\.gemini\antigravity\brain\dfa7493d-5591-4567-9e32-7365364fe3ea\media__1779564387409.jpg"
dst = r"C:\Users\SOLUTIONSµ\.gemini\antigravity\scratch\blick-machinery\public\logo.jpg"

try:
    print(f"Checking if source exists: {os.path.exists(src)}")
    shutil.copy(src, dst)
    print("Logo copied successfully!")
except Exception as e:
    print(f"Error copying logo: {e}")
