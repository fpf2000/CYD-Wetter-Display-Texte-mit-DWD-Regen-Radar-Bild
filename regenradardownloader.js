const { Jimp } = require('jimp');
const axios = require('axios');

async function processAndResizeRadar() {
    try {
        // Das von dir gewünschte Thüringen-Radar (aktbf = mit Bundesländern/Grenzen)
        const url = 'https://www.dwd.de/DWD/wetter/radar/rad_thu_aktbf.jpg';
        
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const image = await Jimp.read(response.data);
        
        // TRICK 1: ERFURT-ZOOM (Zentrum ausschneiden)
        const originalWidth = image.width;
        const originalHeight = image.height;
        
        // Gewünschte Display-Größe (Schön groß, zentriert sich dank V7.5/7.6 von allein!)
        const cropWidth = 240;  
        const cropHeight = 180;
        
        // Berechne die Mitte der DWD-Karte
        const startX = Math.floor((originalWidth - cropWidth) / 2);
        const startY = Math.floor((originalHeight - cropHeight) / 2);
        
        // Schneidet das Bild genau um Erfurt herum aus
        image.crop({ x: startX -140, y: startY +95, w: cropWidth, h: cropHeight });
        
        // TRICK 2: EXTRA KOMPRIMIERUNG
        // Reduziert die Farbstufen. Drückt die Dateigröße im Speicher massiv nach unten (KB),
        // ohne dass die Leserlichkeit der Radarwolken leidet!
        image.posterize(16);
        
        const buffer = await image.getBuffer('image/png');
        
        writeFile('0_userdata.0', 'wetterdisplay/radar.png', buffer, function (err) {
            if (err) {
                log('Fehler beim Speichern: ' + err, 'error');
            } else {
                log('Erfolg: Thüringen-Radar auf Erfurt zentriert! Größe: ' + Math.round(buffer.length/1024) + ' KB');
            }
        });

    } catch (error) {
        log('Fehler bei der Bildkonvertierung: ' + error, 'error');
    }
}

processAndResizeRadar();
schedule("*/5 * * * *", processAndResizeRadar);
