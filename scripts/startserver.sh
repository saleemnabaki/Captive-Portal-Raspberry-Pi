#!/bin/bash

# Replace 'wlan0' with the name of your Wi-Fi interface if it's different
WIFI_INTERFACE="wlan0"

# Function to get the current IP address of the Wi-Fi interface
get_ip_address() {
  ip addr show $WIFI_INTERFACE | grep "inet\b" | awk '{print $2}' | cut -d/ -f1
}

# Check the current IP address
CURRENT_IP=$(get_ip_address)

# Determine connection status
if [ -n "$CURRENT_IP" ]; then
  STATUS="connected"
else
  STATUS="disconnected"
fi

# Perform actions based on the connection status
cd /home/pi/server/scripts

if [ "$STATUS" = "connected" ]; then
  echo "Starting Server 1"
  cd /home/pi/server/server1
  sudo node server1.js

elif [ "$STATUS" = "disconnected" ]; then
  echo "Starting Server 2"
  cd /home/pi/server/server2
  sudo node server2.js
fi
