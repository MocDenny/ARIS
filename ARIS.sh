# start python server
source .venv/bin/activate
python3 ./BackendPy/vocalsystem.py &
npm start & 
sleep 3
# start chrome page in kiosk mode
DISPLAY=:0 XAUTHORITY=/root/.Xauthority chromium --no-sandbox --kiosk http://localhost:3000