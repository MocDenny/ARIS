# Chiude Chromium vecchi
pkill -f chromium 2>/dev/null || true

sleep 3

# Avvia Chromium sul display DSI
/usr/bin/chromium \
  --kiosk \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-infobars \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --app=http://localhost:3000 \
  --start-fullscreen \
  >> /root/aris-chromium.log 2>&1 &
