const { exec } = require("child_process");

const filePath = `/media/daniel/SSD/Users/daniel/Pictures/.desktop/SSNI-431`
exec(`cd /media/daniel/SSD/Users/daniel/Pictures/.desktop && sh thumbnails.sh SSNI-431`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});