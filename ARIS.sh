# start python server
source .venv/bin/activate
python3 /BackendPy/vocalsystem.py
npm start
# start chrome page in kiosk mode
#exec DISPLAY=:0 XAUTHORITY=/root/.Xauthority chromium --no-sandbox --kiosk http://localhost:3000

