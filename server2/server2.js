const express = require('express');
const wifi = require('node-wifi');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const network = require('node-network-manager');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

wifi.init({
    iface: 'wlan0'  // Adjust this to the default interface or leave it null to auto-select
});

createHotspot();

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/saleem', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'saleem.html'));
});

app.get('/scan', (req, res) => {
    wifi.scan((err, networks) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to scan for networks' });
        } else {
            res.json(networks);
        }
    });
});

// Connect to a network and save credentials
app.post('/connect', (req, res) => {
    const { ssid, password } = req.body;
    wifi.connect({ ssid: ssid, password: password }, (error) => {

            console.log('Connected to', ssid);
            saveCredentials(ssid, password);
            res.send('Connection successful');

            // Wait for 10 seconds to ensure credentials are saved and connection stabilizes
            setTimeout(() => {
                checkIpAddress((hasIp) => {
                    if (hasIp) {
                        exec('sudo /home/pi/server/scripts/reboot.sh', (error, stdout, stderr) => {
                            if (error) {
                                console.error('Error rebooting:', error);
                            } else {
                                console.log('Rebooting...');
                            }
                        });
                    } else {
                        console.error('Failed to obtain IP address');
                    }
                });
            }, 20000);
        
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server2 is running on port ${PORT}`);
});

// Function to create Hotspot
function createHotspot() {
    // Initialize Hotspot
    network.wifiHotspot("wlan0", "Raspberry Pi 4", "1234567890")
        .then(data => console.log(data))
        .catch(error => console.log(error));
                    // Wait for 2 seconds before executing the script
            setTimeout(() => {
                exec('sudo -u pi DISPLAY=:0 /home/pi/server/scripts/hotspot_browser.sh', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing hotspot_browser.sh: ${error}`);
                    } else {
                        console.log(`hotspot_browser.sh output: ${stdout}`);
                    }
                });
            }, 6000); // 2-second delay
}

// Function to save network credentials
function saveCredentials(ssid, password) {
    const config = `
network={
    ssid="${ssid}"
    psk="${password}"
    key_mgmt=WPA-PSK
}
    `;
    exec(`echo "${config}" | sudo tee -a /etc/wpa_supplicant/wpa_supplicant.conf`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error saving credentials: ${error}`);
        } else {
            console.log('Credentials saved successfully');
            exec('wpa_cli -i wlan0 reconfigure', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error reconfiguring wpa_supplicant: ${error}`);
                } else {
                    console.log('wpa_supplicant reconfigured successfully');
                }
            });
        }
    });
}

// Function to check if IP address is assigned
function checkIpAddress(callback) {
    exec('hostname -I', (error, stdout, stderr) => {
        if (error) {
            console.error('Error checking IP address:', error);
            callback(false);
        } else {
            const hasIp = stdout.trim().length > 0;
            console.log('IP Address:', stdout.trim());
            callback(hasIp);
        }
    });
}
