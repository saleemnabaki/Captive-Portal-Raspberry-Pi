
const Gpio = require('onoff').Gpio;

const button = new Gpio(514, 'in', 'falling', { debounceTimeout: 300 });
const exec = require('child_process').exec;
const wifi = require('node-wifi');

wifi.init({
  iface: 'wlan0'
});






button.watch(handleButtonPress);

process.on('SIGINT', () => {
  button.unexport();
  process.exit();
});

function handleButtonPress(err, value) {
  if (err) {
    throw err;
  }

  console.log('Button value:', value);

  if (value === 0) {
    console.log('Button pressed. Deleting all saved network connections...');
    wifi.disconnect(error => {
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Disconnected from network');
        exec('sudo rm -f /etc/NetworkManager/system-connections/* && sudo systemctl restart NetworkManager', (error, stdout, stderr) => {
          if (error) {
            console.error('Error:', error);
            return;
          }
          console.log('Rebooting...');
          setTimeout(() => {
            exec('sudo reboot', (error, stdout, stderr) => {
              if (error) {
                console.error('Error during reboot:', error);
                return;
              }
              console.log('Reboot initiated:', stdout);
            });
          }, 3000);
        });
      }
    });
  }
}
