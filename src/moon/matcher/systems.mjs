// Reviewed US catalog port records. A cable can join only the two roles in a rule.
// A device can have several separate roles, including analog and digital RCA.
// Catalog URLs identify hardware, not stock. Sources identify the evidence.
const product = (handle) => 'https://www.moon-audio.com/products/' + handle
const akUsb = product('silver-dragon-usb-cable')
const airM1 = 'https://support.apple.com/en-us/111883'
const pro14 = 'https://support.apple.com/en-us/111902'
const miniM2 = 'https://support.apple.com/en-us/111837'
const iphoneUsb = 'https://support.apple.com/en-us/105099'
const zenDac = 'https://media.ifi-audio.com/wp-content/uploads/2024/04/ZEN-DAC-3-User-Manual_Ver1.0.pdf'
const zenCan = 'https://media.ifi-audio.com/wp-content/uploads/2024/01/ZEN-CAN-3-User-Manual_Ver1.0.pdf'
const originalMojo2 = 'https://chordelectronics.co.uk/wp-content/uploads/2022/01/Mojo-2-user-manual-V.1.2.pdf'
const updatedMojo2 = 'https://chordelectronics.co.uk/wp-content/uploads/2022/01/Mojo-2-4.4-user-manual.pdf'
const ariaManual = 'https://dam.focal-naim.com/m/285e6938a33a5e6f/original/Notice_Aria_Evo_X_web-pdf.pdf'
const kantaManual = 'https://dam.focal-naim.com/m/3a39330e7f5beb4/original/Notice_Kanta_Web-pdf.pdf'
const yamahaManual = 'https://usa.yamaha.com/files/download/other_assets/3/1335553/AV19-0030_RX-V6A_user_guide_En_UCRABGLFPH_H0.pdf'
const dockReference = product('pd10-cradle')
const dockedXlr = { xlrOut: 'Left and right XLR line outputs on the attached Astell&Kern DAP Docking Cradle' }
const sopraManual = 'https://dam.focal-naim.com/m/46067912322da84e/original/Notice_Sopra_Web-pdf.pdf'

// These are electrical roles. Identical-looking connectors are never joined by shape.
const labels = {
  computerC: 'USB-C computer audio output',
  computerA: 'USB-A computer audio output',
  streamerA: 'USB-A digital audio output for an external DAC',
  portableC: 'USB-C digital audio output',
  androidC: 'USB-C digital audio output (OTG host)',
  portableMicro: 'Micro-USB digital audio output (OTG)',
  usbB: 'USB-B audio input',
  usbC: 'USB-C audio input',
  usbMicro: 'Micro-USB audio input',
  portableDacC: 'USB-C audio input',
  portableDacMicro: 'Micro-USB audio input',
  aesOut: '3-pin XLR AES/EBU digital output',
  aesIn: '3-pin XLR AES/EBU digital input',
  coaxRcaOut: 'RCA coaxial digital output (S/PDIF)',
  coaxRcaIn: 'RCA coaxial digital input (S/PDIF)',
  coaxBncOut: 'BNC coaxial digital output (S/PDIF)',
  coaxBncIn: 'BNC coaxial digital input (S/PDIF)',
  dualBncOut: 'Dual-data BNC OUT 1 and OUT 2',
  dualBncIn: 'Dual-data BNC inputs 1 and 2',
  dualMiniIn: '3.5 mm dual-data coaxial input',
  rcaOut: 'Left and right RCA analog outputs',
  rcaIn: 'Left and right RCA analog line inputs',
  xlrOut: 'Left and right 3-pin XLR analog outputs',
  xlrIn: 'Left and right 3-pin XLR analog line inputs',
  variableRca: 'Volume-controlled RCA preamp outputs, left and right',
  variableXlr: 'Volume-controlled 3-pin XLR preamp outputs, left and right',
  powerRca: 'Left and right RCA power-amp inputs',
  powerXlr: 'Left and right 3-pin XLR power-amp inputs',
  switchPort: 'RJ45 copper Ethernet switch port',
  network: 'RJ45 Ethernet network port',
  speakerOut: 'Left and right amplified speaker outputs',
  phonoMmOut: 'L/R RCA phono output and ground, with the supplied moving-magnet cartridge',
  phonoMmIn: 'L/R RCA phono input and ground, set for moving magnet (MM)',
  phonoMcOut: 'L/R RCA phono output and ground, with the supplied moving-coil cartridge',
  phonoMcIn: 'L/R RCA phono input and ground, set for moving coil (MC)',
  clockOut: 'Both BNC word-clock outputs (44.1 and 48 kHz)',
  clockIn: 'Two BNC word-clock inputs',
  usPower: 'Grounded 120 V US AC outlet',
  acIn: 'IEC C14 AC inlet on the 120 V US model',
  towerOut: 'Amplified front left and right speaker outputs',
  towerIn: 'Positive and negative binding posts on each floorstanding speaker',
  monitorOut: 'Amplified front left and right speaker outputs',
  monitorIn: 'Positive and negative 4 mm terminals on each passive speaker',
  centerOut: 'Amplified CENTER speaker output',
  centerIn: 'Positive and negative terminals on the single center speaker',
  passiveIn: 'Positive and negative terminals on each passive speaker',
}

// A listed handle is the exact product in the public US catalog. An independent
// reference can supply extra details or identify gear outside the sellable catalog.
function device(brand, model, handle, ports, reference, portLabels = {}) {
  const listing = handle ? product(handle) : undefined
  return { brand, model, listing, ports, source: reference || listing, portLabels }
}

const devices = [
  device('Apple', 'MacBook Air (M1, 2020)', null, ['computerC'], airM1),
  device('Apple', 'MacBook Pro (14-inch, 2021)', null, ['computerC'], pro14),
  device('Apple', 'Mac mini (M2, 2023)', null, ['computerC', 'computerA'], miniM2),
  device('Apple', 'iPhone 15 Pro', null, ['portableC'], iphoneUsb),
  device('Astell&Kern', 'A&ultima SP3000', null, ['portableC', 'androidC'], akUsb),
  device('Onkyo', 'DP-X1', null, ['portableMicro'], akUsb),
  device('iFi', 'ZEN DAC 3', null, ['usbC', 'rcaOut'], zenDac, {
    usbC: 'Rear USB-C digital audio input',
    rcaOut: 'Rear L/R RCA line outputs',
  }),
  device('iFi', 'ZEN CAN 3', null, ['rcaIn'], zenCan),
  device('iFi', 'hip-dac 3', 'hip-dac-3', ['usbC', 'portableDacC'], null, {
    usbC: 'USB-C audio data input beside the separate charging port',
    portableDacC: 'USB-C audio data input beside the separate charging port',
  }),
  device('iFi', 'iDSD Valkyrie', 'ifi-idsd-valkyrie-headphone-amp-dac', ['usbC', 'portableDacC'], null, {
    usbC: 'USB-C digital audio input (separate charging port)',
    portableDacC: 'USB-C digital audio input (separate charging port)',
  }),
  device('Focal', 'Bathys MG', 'bathys-mg-wireless-headphones', ['usbC'], null, {
    usbC: 'USB-C input with the headphones switched to DAC mode',
  }),
  device('Chord Electronics', 'Mojo 2 (two 3.5 mm sockets)', null, ['usbC', 'usbMicro', 'portableDacC', 'portableDacMicro', 'dualMiniIn'], originalMojo2, {
    usbMicro: 'Micro-USB audio input beside the separate charging socket',
    portableDacMicro: 'Micro-USB audio input beside the separate charging socket',
  }),
  device('Chord Electronics', 'Mojo 2 (4.4 mm edition)', 'chord-mojo-dac-headphone-amp', ['usbC', 'usbMicro', 'portableDacC', 'portableDacMicro', 'dualMiniIn'], updatedMojo2, {
    usbMicro: 'Micro-USB digital audio input',
    portableDacMicro: 'Micro-USB digital audio input',
  }),
  device('Chord Electronics', 'Hugo 2', 'chord-hugo-2-dac-headphone-amp', ['usbMicro', 'portableDacMicro', 'dualMiniIn', 'rcaOut'], null, {
    usbMicro: 'Micro-USB digital audio input beside the separate charging socket',
    portableDacMicro: 'Micro-USB digital audio input beside the separate charging socket',
  }),
  device('Chord Electronics', 'Qutest', 'chord-qutest-dac', ['usbB', 'coaxBncIn', 'dualBncIn', 'rcaOut'], null, {
    usbB: 'USB-B audio input (the Micro-USB socket is for power)',
  }),
  device('Chord Electronics', 'Hugo TT 2', 'chord-hugo-tt-2-dac', ['usbB', 'coaxBncIn', 'dualBncIn', 'xlrOut', 'rcaOut']),
  device('Chord Electronics', 'DAVE', 'chord-dave-dac', ['usbB', 'aesIn', 'coaxBncIn', 'dualBncIn', 'xlrOut', 'rcaOut']),
  device('Chord Electronics', 'Hugo M Scaler', 'chord-hugo-m-scaler', ['usbB', 'coaxBncIn', 'coaxBncOut', 'dualBncOut']),
  device('Chord Electronics', '2yu', 'chord-2yu-digital-interface', ['streamerA', 'coaxBncOut', 'coaxRcaOut', 'network'], null, {
    network: 'RJ45 Ethernet on 2go, which attaches to 2yu',
    streamerA: '2yu USB-A digital audio output with 2go attached',
    coaxRcaOut: '2yu RCA S/PDIF output with 2go attached',
    coaxBncOut: '2yu BNC S/PDIF output with 2go attached',
  }),
  device('Chord Electronics', 'Alto', 'alto-headphone-nearfield-monitor-amplifier', ['rcaIn', 'xlrIn']),
  device('Chord Electronics', 'Anni', null, ['rcaIn'], 'https://chordelectronics.co.uk/wp-content/uploads/2021/09/Anni-user-manual-V1.1.pdf'),
  device('Chord Electronics', 'Etude', 'chord-choral-etude-amp', ['powerRca', 'powerXlr']),
  device('Chord Electronics', 'Ultima 6', 'chord-ultima6-amplifier', ['powerRca', 'powerXlr']),
  device('dCS', 'Lina Network DAC', 'dcs-lina-network-dac', ['clockIn', 'network', 'usbB', 'aesIn', 'coaxRcaIn', 'coaxBncIn', 'rcaOut', 'xlrOut']),
  device('dCS', 'Lina DAC X', 'lina-dac-x', ['network', 'usbB', 'aesIn', 'coaxRcaIn', 'coaxBncIn', 'xlrOut', 'rcaOut']),
  device('dCS', 'Bartók APEX Headphone DAC', 'bartok-apex-dac-headphone-amplifier', ['network', 'usbB', 'aesIn', 'coaxBncIn', 'coaxRcaIn', 'rcaOut', 'xlrOut']),
  device('dCS', 'Lina Headphone Amplifier', 'dcs-lina-headphone-amplifier', ['rcaIn', 'xlrIn']),
  device('Aurender', 'N200', 'aurender-n200', ['network', 'coaxRcaOut']),
  device('Aurender', 'N20', 'aurender-n20-streaming-music-server', ['network', 'coaxRcaOut', 'aesOut']),
  device('Aurender', 'N50', 'aurender-n50-high-end-music-server', ['network', 'coaxBncOut', 'coaxRcaOut']),
  device('Aurender', 'A15', 'aurender-a15-dac-music-server', ['network', 'coaxRcaIn', 'rcaOut', 'xlrOut', 'variableRca', 'variableXlr']),
  device('Aurender', 'A20', 'aurender-a20-music-server', ['network', 'coaxRcaIn', 'coaxBncIn', 'rcaOut', 'xlrOut', 'variableRca', 'variableXlr']),
  device('Aurender', 'A1000', 'a1000-music-server-streamer-dac', ['rcaOut', 'variableRca']),
  device('Aurender', 'A30', 'aurender-a30-music-server', ['network', 'coaxRcaIn', 'coaxBncIn']),
  device('Aurender', 'NH10', 'aurender-nh10-audiophile-network-switch', ['switchPort']),
  device('Matrix Audio', 'SS-1 Pro', 'ss-1-pro-audio-grade-network-switch', ['switchPort']),
  device('iFi', 'OMNI LAN', 'ifi-omni-lan', ['switchPort'], null, {
    switchPort: 'One of the two clean RJ45 Ethernet ports for audio gear',
  }),
  device('Bluesound', 'NODE ICON', 'node-icon-reference-music-streamer', ['network', 'streamerA', 'usbC', 'rcaOut', 'xlrOut', 'rcaIn', 'coaxRcaOut'], null, {
    streamerA: 'USB-A audio output to an external DAC (select USB output in BluOS)',
    usbC: 'USB-C digital input from a computer',
  }),
  device('Bluesound', 'HUB', 'bluesound-hub-music-streamer', ['network', 'rcaIn', 'coaxRcaIn']),
  device('Bluesound', 'VAULT 2i', 'bluesound-vault-2i-network-drive-ripper-streamer', ['network']),
  device('Wattson Audio', 'Emerson DIGITAL', 'emerson-digital-bridge-endpoint', ['network', 'aesOut', 'coaxRcaOut']),
  device('Wattson Audio', 'Emerson ANALOG', 'wattson-audio-emerson-analog-network-bridge-endpoint', ['network']),
  device('Wattson Audio', 'Madison Streamer', 'wattson-audio-madison-streamer-le', ['coaxRcaIn']),
  device('Matrix Audio', 'ND-1', 'matrix-audio-nd-1-audio-dac', ['usbB', 'usbC', 'aesIn', 'rcaOut', 'xlrOut']),
  device('Matrix Audio', 'TS-1', 'matrix-ts-1-streaming-music-server-dac-and-headphone-amplifier', ['rcaOut', 'xlrOut']),
  device('Matrix Audio', 'MS-1c', 'ms-1c-music-streamer', ['rcaOut', 'xlrOut', 'aesOut']),
  device('Matrix Audio', 'TT-1', 'matrix-audio-tt-1-streaming-music-server', ['aesOut']),
  device('Matrix Audio', 'NT-1', 'matrix-audio-nt-1-streaming-music-server', ['aesOut']),
  device('Matrix Audio', 'MP-1', 'mp-1-preamplifier', ['rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('Matrix Audio', 'NA-1', 'matrix-audio-na-1-headphone-amplifier', ['rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('Bricasti Design', 'M1 Series II', 'm1s2-digital-to-analog-converter', ['aesIn', 'coaxRcaIn', 'coaxBncIn', 'rcaOut', 'xlrOut']),
  device('Bricasti Design', 'M3 DAC', 'bricasti-design-m3-dac', ['aesIn', 'coaxRcaIn', 'rcaOut', 'xlrOut']),
  device('Bricasti Design', 'M20', 'bricasti-m20-preamplifier', ['rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('TEAC', 'HA-507', 'ha-507-balanced-high-output-headphone-amplifier', ['rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('TEAC', 'AP-507', 'teac-ap-507-stereo-power-amplifier', ['powerRca', 'powerXlr']),
  device('TEAC', 'UD-507', 'ud-507-dac-preamp-headphone-amp', ['usbC', 'rcaIn', 'xlrIn', 'coaxRcaIn']),
  device('TEAC', 'UD-701N', 'ud-701n-headphone-amplifier-usb-dac-and-network-player', ['rcaIn', 'xlrIn']),
  device('TEAC', 'NT-505-X', 'teac-nt-505-x-usb-dac-network-player', ['rcaOut', 'xlrOut']),
  device('TEAC', 'UD-505-X', 'teac-ud-505-x-headphone-amplifier', ['rcaOut', 'xlrOut']),
  device('Ferrum', 'OOR', 'ocr-headphone-amplifier', ['rcaIn', 'xlrIn']),
  device('Cayin', 'HA-300 MK3', 'ha-300-mk3-tube-headphone-amplifier', ['rcaIn', 'xlrIn']),
  device('Moon Audio', 'Dragon Inspire IHA-1', 'dragon-inspire-iha-1-tube-headphone-amp', ['rcaIn', 'variableRca']),
  device('HeadAmp', 'GS-X mini', 'headamp-gsx-mini-balanced-headphone-amp-preamplifier', ['rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('Sennheiser', 'HDV 820', 'sennheiser-hdv-820-headphones-amplifier', ['rcaIn', 'xlrIn']),
  device('Bryston', 'BHA-1', 'bryston-bha-1-balanced-headphone-amplifier', ['rcaIn', 'xlrIn']),
  device('Pass Labs', 'XP-12', 'pass-labs-xp-12-preamplifier', ['rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('Pass Labs', 'HPA-1c', 'pass-labs-hpa-1-headphone-amp', ['rcaIn', 'variableRca']),
  device('Pass Labs', 'INT-60', 'pass-labs-int-60-integrated-amplifier', ['rcaIn', 'xlrIn']),
  device('Pass Labs', 'INT-250', 'pass-labs-int-250-stereo-amplifier', ['rcaIn', 'xlrIn', 'towerOut'], 'https://www.passlabs.com/wp-content/uploads/2019/12/INT-250_om.pdf'),
  device('Pass Labs', 'INT-25', 'pass-labs-int-25-amplifier', ['rcaIn', 'speakerOut']),
  device('Pass Labs', 'X150.8', 'pass-labs-x150-8-amplifier', ['powerRca', 'powerXlr']),
  device('Pass Labs', 'XA25', 'pass-labs-xa25-power-amplifier', ['powerRca']),
  device('NAD', 'C 3050', 'c-3050-stereophonic-amplifier', ['network', 'rcaIn', 'coaxRcaIn', 'phonoMmIn'], null, {
    network: 'RJ45 LAN on the optional BluOS-D module, if installed',
  }),
  device('NAD', 'C 389', 'c-389-bluos-d-integrated-amplifier', ['rcaIn']),
  device('Focal', 'Shape 50', 'focal-shape-50-monitor-speaker', ['powerRca', 'powerXlr'], null, {
    powerRca: 'RCA line input on each powered Shape 50 monitor',
    powerXlr: 'Balanced XLR line input on each powered Shape 50 monitor',
  }),
  device('Focal', 'Shape 65', 'focal-shape-65-monitor-speaker', ['powerRca', 'powerXlr'], null, {
    powerRca: 'RCA line input on each powered Shape 65 monitor',
    powerXlr: 'Balanced XLR line input on each powered Shape 65 monitor',
  }),
  device('Chord Electronics', 'Huei', 'chord-huei-phono-preamplifier', ['rcaOut', 'xlrOut', 'phonoMmIn', 'phonoMcIn']),
  device('Chord Electronics', 'Suzi Pre', 'chord-suzi-pre-preamplifier', ['phonoMmIn', 'phonoMcIn']),
  device('Audio-Technica', 'AT-LP7X', 'at-lp7x-fully-manual-belt-drive-turntable', ['phonoMmOut', 'rcaOut'], 'https://docs.audio-technica.com/all/AT-LP7X-UM-EN.pdf', {
    phonoMmOut: 'RCA jacks with the output switch at PHONO and the supplied VM95E cartridge',
    rcaOut: 'L/R RCA output with the built-in preamp switched to LINE',
  }),
  device('Audio-Technica', 'AT-LP8X', 'audio-technica-at-lp8x-belt-drive-turntable', ['phonoMmOut']),
  device('Audio-Technica', 'AT-LPA2', 'audio-technica-at-lpa2-belt-drive-turntable', ['phonoMcOut']),
  device('dCS', 'Lina Master Clock', 'dcs-lina-master-clock', ['clockOut']),
  device('Cardas Audio', 'Nautilus (US outlets)', 'cardas-nautilus-power-strip', ['usPower'], 'https://www.cardas.com/nautilus'),
  device('Torus Power', 'TOT Max (North America)', 'tot-max-power', ['usPower']),
  device('Ferrum', 'HYPSOS (US model)', 'hypsos-hybrid-power-supply', ['acIn'], 'https://ferrum.audio/hypsos/'),
  device('Ferrum', 'HYPSOS Dual Output (US model)', 'hypsos-dual-amplifier', ['acIn'], 'https://ferrum.audio/hypsos-dual-output/'),
  device('iFi', 'GO bar Kensei', 'go-bar-kensei-headphone-amp-dac', ['usbC'], 'https://ifi-audio.com/products/go-bar-kensei/'),
  device('iFi', 'iDSD Diablo 2', 'idsd-diablo-2', ['usbC', 'portableDacC'], null, {
    usbC: 'USB-C data input beside the separate 5 V charging port',
    portableDacC: 'USB-C data input beside the separate 5 V charging port',
  }),
  device('iFi', 'NEO iDSD 3', 'ifi-neo-idsd-3-ultra-res-dac-headphone-amplifier', ['rcaIn', 'variableRca']),
  device('iFi', 'iDSD Phantom', 'flagship-idsd-phantom-headphone-amplifier', ['network', 'rcaOut', 'xlrOut']),
  device('Aurender', 'A200', 'a200-music-server-preamplifier-and-dac-open-box', ['network', 'variableRca', 'rcaOut']),
  device('Aurender', 'ACS10', 'aurender-acs10-music-server-cd-ripper', ['network'], null, {
    network: 'Main LAN port marked 2X Isolated',
  }),
  device('Bluesound', 'POWERNODE N330', 'bluesound-powernode-wireless-multi-room-music-streaming-amplifier', ['network']),
  device('Bluesound', 'PULSE SOUNDBAR+', 'bluesound-pulse-soundbar', ['network']),
  device('Bricasti Design', 'M11 Series II', 'bricasti-model-11-series-ii-r2r-d-a-converter', ['aesIn', 'coaxBncIn', 'coaxRcaIn', 'rcaOut', 'xlrOut']),
  device('Bricasti Design', 'M12 Source Controller', 'bricasti-m12-source-controller', ['xlrIn', 'rcaIn']),
  device('Bricasti Design', 'M19', 'bricasti-m19-reference-sacd-cd-i2s-transport', ['coaxBncOut', 'coaxRcaOut', 'aesOut'], null, {
    coaxBncOut: 'BNC coaxial S/PDIF output for CD playback',
    coaxRcaOut: 'RCA coaxial S/PDIF output for CD playback',
    aesOut: '3-pin XLR single-wire AES/EBU output for CD playback',
  }),
  device('Bricasti Design', 'M5', 'bricasti-m5-network-player', ['network', 'aesOut']),
  device('Bryston', 'BDA-3.14', 'bryston-bda-314-dac', ['aesIn']),
  device('Bryston', 'BDP-3', 'bryston-bdp3-digital-player', ['network', 'aesOut']),
  device('Esoteric', 'N-05XE', 'n-05xd-headphone-amplifier-usb-dac-and-network-player', ['network']),
  device('Ferrum', 'BROEN', 'broen-network-streaming-transport', ['coaxRcaOut', 'aesOut']),
  device('Ferrum', 'WANDLA', 'wandla-fully-balanced-dac-preamp', ['rcaIn']),
  device('Ferrum', 'WANDLA HP', 'wandla-hp-with-headphone-amplifier', ['rcaIn']),
  device('Fezz Audio', 'Titania', 'fezz-audio-titania-stereo-tube-amplifier', ['rcaIn']),
  device('HeadAmp', 'Blue Hawaii Special Edition', 'headamp-blue-hawaii-electrostatic-headphone-amplifier', ['rcaIn', 'xlrIn']),
  device('Manley Labs', 'Absolute Headphone Amplifier', 'manley-labs-absolute-tube-amp', ['rcaIn']),
  device('NAD', 'C 589', 'c-589-cd-player', ['rcaOut', 'xlrOut', 'aesOut']),
  device('NAD', 'M23 V2', 'nad-m23-v2-stereo-power-amplifier', ['powerRca', 'powerXlr']),
  device('NAD', 'M33 V2', 'nad-m33-v2-bluos-streaming-dac-amplifier', ['network', 'aesIn', 'rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('NAD', 'Masters M66', 'masters-m66-bluos-streaming-dac-preamplifier', ['network', 'aesIn', 'rcaIn', 'xlrIn']),
  device('Wattson Audio', 'Madison Amplifier', 'wattson-audio-madison-amplifier', ['powerRca', 'powerXlr']),
  device('Pass Labs', 'X250.8', 'pass-labs-x250-8-stereo-amplifier', ['powerRca', 'powerXlr']),
  device('Pass Labs', 'XA30.8', 'pass-labs-xa30-8-stereo-power-amplifier', ['powerRca', 'powerXlr']),
  device('Pass Labs', 'XA60.8', 'pass-labs-xa60-8-monoblock-amplifier-pair', ['powerXlr'], null, {
    powerXlr: '3-pin XLR input on each of two monoblocks',
  }),
  device('Pass Labs', 'XP-22', 'xp-22-preamplifier', ['rcaIn', 'xlrIn', 'variableRca', 'variableXlr']),
  device('TEAC', 'NT-507T', 'nt-507t-network-transport', ['network', 'streamerA'], null, {
    streamerA: 'USB-A output marked for a DAC (separate drive port)',
  }),
  device('TEAC', 'PD-507T', 'teac-pd-507t-cd-transport', ['coaxRcaOut']),
  device('TEAC', 'VRDS-701T', 'vrds-701t-cd-transport', ['coaxRcaOut']),
  device('TEAC', 'VRDS-701', 'vrds-701-cd-player-usb-dac', ['usbC', 'coaxRcaOut', 'rcaOut', 'xlrOut']),
  device('Technics', 'SU-G700M2', 'su-g700m2-stereo-integrated-amplifier', ['usbB']),
  device('Sennheiser', 'AMBEO Soundbar Max', 'sennheiser-ambeo-soundbar-max', ['network']),
  device('Sennheiser', 'AMBEO Soundbar Plus', 'sennheiser-ambeo-soundbar-plus', ['network']),
  device('Bricasti Design', 'M15', 'bricasti-m15', ['powerRca', 'powerXlr'], 'https://www.bricasti.com/manuals/M15_M25_power_amp_12.22.pdf'),
  device('Bricasti Design', 'M28', 'bricasti-m28-monoblock-amplifier', ['powerRca', 'powerXlr'], 'https://www.bricasti.com/manuals/M28_power_amp_12.22.pdf', {
    powerRca: 'RCA input on each of two monoblocks',
    powerXlr: '3-pin XLR input on each of two monoblocks',
  }),
  device('Bricasti Design', 'M18', 'bricasti-m18-dual-mono-amplifier', ['powerXlr'], 'https://www.consumer.bricasti.com/consumer/m18-dual-mono-amplifier'),
  device('Matrix Audio', 'MA-1', 'ma-1-power-amplifier', ['powerRca', 'powerXlr']),
  device('Matrix Audio', 'SI-1', 'si-1-audio-grade-network-isolator', ['network', 'switchPort'], null, {
    network: 'RJ45 network input from the router or switch',
    switchPort: 'Isolated RJ45 output to the audio device',
  }),
  device('Matrix Audio', 'SU-1', 'su-1-isolated-usb-switcher-with-linear-psu-moon-audio', ['usbB', 'usbC', 'streamerA'], null, {
    usbB: 'USB-B source input B1 or B2',
    usbC: 'USB-C source input C1',
    streamerA: 'USB-A DAC output A1 or A2, with an audio source connected',
  }),
  device('Technics', 'SU-R1000', 'stereo-integrated-amplifier-su-r1000', ['xlrIn']),
  device('Technics', 'SL-G700M2', 'sl-g700m2-sacd-player-and-network-music-player', ['usbB']),
  device('Chord Electronics', 'ULTIMA PRE 2', 'chord-ultima-pre-preamp', ['variableRca', 'variableXlr']),
  device('Chord Electronics', 'Suzi', 'chord-suzi-stereo-power-amplifier', ['powerRca']),
  device('Esoteric', 'K-05XD', 'esoteric-k-05xd-super-audio-cd-cd-player', ['rcaOut', 'xlrOut'], null, {
    xlrOut: '3-pin XLR analog output in standard XLR mode',
  }),
  device('TEAC', 'AP-701', 'teac-ap-701', ['powerRca', 'powerXlr']),
  device('NAD', 'CS1', null, ['network', 'rcaOut'], product('cs1-endpoint-network-streamer')),
  device('Bricasti Design', 'M21', 'bricasti-m21-digital-analog-converter', ['aesIn', 'coaxBncIn', 'coaxRcaIn', 'rcaOut', 'xlrOut'], 'https://www.bricasti.com/images/m21_manual.pdf'),
  device('Matrix Audio', 'element P', 'matrix-audio-element-p', ['network', 'usbB'], 'https://www.matrix-digi.com/pdf/element_P_Manual_EN.pdf'),
  device('Matrix Audio', 'X-SABRE 3', 'x-sabre-3-mqa-dac', ['network', 'usbB', 'rcaOut', 'xlrOut'], 'https://www.matrix-digi.com/pdf/X-SABRE_3_Manual_EN.pdf'),
  device('Matrix Audio', 'MS-1', 'ms-1-music-streamer', ['network', 'xlrOut'], 'https://www.matrix-digi.com/product/99/MS-1', {
    xlrOut: 'Fixed left and right XLR line outputs',
  }),
  device('iFi', 'NEO Stream 3', 'neo-stream-3-dac-network-audio-streamer', ['network', 'rcaOut', 'streamerA', 'aesOut'], 'https://ifi-audio.com/products/neo-stream-3', {
    streamerA: 'Rear USB-A audio output to an external DAC',
  }),
  device('Lehmannaudio', 'Black Cube', 'lehmann-black-cube', ['phonoMmIn', 'phonoMcIn', 'rcaOut'], 'https://www.lehmannaudio.com/phono-stages/black-cube.html'),
  device('Lehmannaudio', 'Decade', 'decade-phono-preamp', ['phonoMmIn', 'phonoMcIn', 'rcaOut'], 'https://www.lehmannaudio.com/phono-stages/decade.html'),
  device('Manley Labs', 'Oasis', 'oasis-phono-preamp', ['phonoMmIn', 'phonoMcIn', 'rcaOut']),
  device('Pass Labs', 'XP-17', 'xp-17-preamplifier', ['phonoMmIn', 'phonoMcIn', 'rcaOut', 'xlrOut'], 'https://www.passlabs.com/wp-content/uploads/2019/12/xp-17_om_170609_0.pdf'),
  // The moving-magnet, current-mode MC and optical editions share line outputs.
  // Their cartridge inputs differ and must be reviewed individually.
  device('Wattson Audio', 'Madison Phono', 'wattson-audio-madison-phono-stage', ['rcaOut']),
  device('DEQX', 'Pre-8', 'pre-8-hd-active-preamp-processor', ['xlrIn'], 'https://www.deqx.com/products/'),
  device('Manley Labs', 'Neo-Classic SE/PP 300B', 'neo-classic-se-pp-300b-monoblock-amp', ['powerRca'], null, {
    powerRca: 'RCA input on each of two SE/PP 300B monoblocks',
  }),
  device('Pass Labs', 'XA160.8', 'xa160-8-amplifier', ['powerXlr'], null, {
    powerXlr: '3-pin balanced XLR input on each of two XA160.8 monoblocks',
  }),
  device('Esoteric', 'S-05XE', 's-05-class-a-amplifier', ['powerRca', 'powerXlr'], 'https://www.esoteric.jp/en/support/news/665', {
    powerXlr: 'Left and right standard XLR inputs, with XLR selected and the amplifier in stereo mode',
    powerRca: 'Left and right RCA inputs, with RCA selected and the amplifier in stereo mode',
  }),
  device('Chord Electronics', 'Quartet', 'quartet-fpga-upscaler', ['usbB']),
  device('Technics', 'SC-CX700', 'sc-cx700-smart-active-speaker-system', ['usbC', 'phonoMmIn'], 'https://eww.pavc.panasonic.co.jp/audiooi/technics/sc_cx700/full/sc_cx700p_tqbm0970_en_full_s.pdf', {
    usbC: 'USB-C audio input on the primary speaker',
    phonoMmIn: 'PHONO left and right RCA jacks and ground on the primary speaker (moving magnet only)',
  }),
  device('Warwick Acoustics', 'APERIO', 'warwick-acoustics-aperio', ['usbB'], null, {
    usbB: 'USB-B input on the APERIO electronics. A USB-A to USB-B cable is supplied.',
  }),
  device('Astell&Kern', 'DAP Docking Cradle', 'pd10-cradle', ['xlrOut'], null, {
    xlrOut: 'Left and right XLR line outputs with a compatible SP4000, PD10 or PD20 docked',
  }),
  device('Astell&Kern', 'A&ultima SP4000', 'astell-kern-a-ultima-sp4000-dap-music-player', ['xlrOut'], dockReference, dockedXlr),
  device('Astell&Kern', 'PD10', 'astell-and-kern-pd10-digital-audio-player-docking-cradle', ['xlrOut'], dockReference, dockedXlr),
  device('Astell&Kern', 'PD20', 'pd20-quad-dac-hi-res-audio-dap', ['xlrOut'], dockReference, dockedXlr),
  // These match only reviewed amplifier output ranges, channel assignments and
  // 4 mm banana terminals. A center channel uses one cable, never both outputs.
  device('Yamaha', 'RX-V6A (US model)', null, ['towerOut', 'monitorOut', 'centerOut'], yamahaManual),
  device('Focal', 'Aria Evo X N°3', 'aria-evo-x-n-3-floorstanding-speaker-each', ['towerIn'], ariaManual),
  device('Focal', 'Aria Evo X N°4', 'aria-evo-x-n-4-floorstanding-speaker-each', ['towerIn'], ariaManual),
  device('Focal', 'Kanta N°2', 'focal-kanta-no2', ['towerIn'], kantaManual),
  device('Focal', 'Sopra N°2', 'focal-sopra-no2', ['towerIn'], sopraManual),
  device('Focal', 'Sopra N°3', 'focal-sopra-no3', ['towerIn'], sopraManual),
  device('Focal', 'Aria Evo X Center', 'aria-evo-x-center-speaker', ['centerIn'], ariaManual),
  device('Focal', 'Kanta Center', 'focal-kanta-center-speaker', ['centerIn'], kantaManual),
  device('Acoustic Energy', 'AE1 40th Anniversary Edition', 'acoustic-energy-ae1-40th-anniversary-edition-passive-speakers', ['monitorIn'], 'https://www.acoustic-energy.co.uk/wp-content/uploads/AE1-40th-Anniversary-User-Manual.pdf'),
  device('Focal', 'Aria Evo X N°1', 'aria-evo-x-n-1-bookshelf-speaker-each', ['passiveIn'], ariaManual),
  device('Focal', 'Sopra N°1', 'focal-sopra-no1', ['passiveIn'], sopraManual),
]

const digitalUsb = ['Black Dragon USB Cable', 'black-dragon-usb-cable']
const formFit = ['Silver Dragon Form Fit USB Cable', 'silver-dragon-form-fit-usb-cable-by-moon-audio']
const coax = ['Black Dragon Coax Digital Cable', 'black-dragon-coax-digital-cable']
const interconnect = ['Blue Dragon Interconnects', 'blue-dragon-interconnect-v2']
const balancedDigital = ['Black Dragon Premium AES Digital Cable', 'black-dragon-aes-digital-cable']
const network = ['Bronze Dragon Network Cable', 'bronze-dragon-network-cable']
const speakerCable = ['Black Dragon Speaker Cable', 'black-dragon-speaker-cable-v2']
const dualData = ['Silver Dragon Coax Digital Cable', 'silver-dragon-digital-cable-v1']
const phono = ['Bronze Dragon Premium Phono Cable', 'bronze-dragon-premium-phono-cable']
const mains = ['Black Dragon Power Cable', 'black-dragon-power-cord-v1']
const dualMini = ['Black Dragon Mini Coax for Chord M Scaler', 'black-mini-coax-hugo-2-hugo-m-scaler']

// Variant IDs select the actual pair of plugs on Moon's US product record.
// No price, inventory availability or checkout action is inferred from a variant.
function rule(output, input, category, cable, variant, note, byPort = true) {
  return { output, input, category, cable, variant, note, byPort }
}
const lineNote = 'Use one cable per channel. Match the source’s output level to the line input. The linked stereo pair is 3 ft.'
const preampNote = 'Use the volume-controlled preamp setting at low volume. The linked 3 ft stereo pair carries left and right separately.'
const coaxNote = 'Use one 75-ohm S/PDIF cable. Select a digital audio input and a sample rate both devices support. The linked example is 3 ft.'
const speakerNote = 'The linked 6 ft pair has banana plugs at both ends. With the amplifier off, connect each channel’s red terminal to red and black to black.'
const rules = [
  rule('computerC', 'usbB', 'USB', digitalUsb, '50068172996922', 'Choose USB-C to standard USB-B for computer audio. The linked example is 3 ft.'),
  rule('computerC', 'usbC', 'USB', digitalUsb, '50068172964154', 'Choose a USB-C to USB-C audio data cable. The linked example is 3 ft.'),
  rule('computerA', 'usbB', 'USB', digitalUsb, '50068112834874', 'Use the USB audio host output and the DAC’s standard USB-B input. The linked example is 3 ft.'),
  rule('computerA', 'usbC', 'USB', digitalUsb, '50068172898618', 'Use the USB audio host output and the USB-C data input. The linked example is 3 ft.'),
  rule('computerA', 'usbMicro', 'USB', digitalUsb, '50068164018490', 'Choose USB-A to Micro-B for data. The linked example is 3 ft.'),
  // Embedded transports are matched here only to independently powered USB-B DACs.
  // Bus-powered dongles and charging-capable USB-C devices need a host power check.
  rule('streamerA', 'usbB', 'USB', digitalUsb, '50068112834874', 'Connect the streamer’s USB audio output to the DAC’s square USB-B data input and power the DAC separately. The linked example is 3 ft.', false),
  rule('portableC', 'portableDacC', 'USB', digitalUsb, '50068172964154', 'Enable USB audio output on the source and select USB on the DAC. This cable uses USB-C on both ends. The linked example is 3 ft.', false),
  rule('androidC', 'portableDacMicro', 'USB', formFit, '49787930706234', 'Choose the directional 6-inch USB-C to Micro-B OTG option and put the USB-C end in the player.', false),
  rule('portableMicro', 'portableDacMicro', 'USB', formFit, '49787930607930', 'This 5-inch Micro-B to Micro-B cable is wired for OTG. Put its host end in the player and its device end in the DAC’s digital input.', false),
  rule('aesOut', 'aesIn', 'Digital', balancedDigital, '51926602645818', 'Use one 110-ohm AES/EBU cable in single-wire mode. The 3 ft example has a female source plug and a male receiving plug.'),
  rule('coaxRcaOut', 'coaxRcaIn', 'Digital', coax, '49901400031546', coaxNote),
  rule('coaxRcaOut', 'coaxBncIn', 'Digital', coax, '49901408878906', coaxNote),
  rule('coaxBncOut', 'coaxRcaIn', 'Digital', coax, '49901400064314', coaxNote),
  rule('coaxBncOut', 'coaxBncIn', 'Digital', coax, '49901408911674', coaxNote),
  rule('dualBncOut', 'dualBncIn', 'Digital', dualData, '49826481307962', 'The M Scaler comes with two BNC cables. For an optional Dragon replacement, use two matching BNC-to-BNC cables, OUT 1 to IN 1 and OUT 2 to IN 2. The 3 ft product link is for one cable.', false),
  rule('dualBncOut', 'dualMiniIn', 'Digital', dualMini, '51605680488762', 'Use the dedicated Chord dual-data cable. Both BNC plugs go in the M Scaler. Its single 3.5 mm plug goes in the DAC’s coaxial input. The linked example is 1.5 ft.', false),
  rule('rcaOut', 'rcaIn', 'Analog', interconnect, '50360522047802', lineNote),
  rule('xlrOut', 'xlrIn', 'Analog', interconnect, '50360508743994', lineNote),
  rule('variableRca', 'powerRca', 'Analog', interconnect, '50360522047802', preampNote, false),
  rule('variableXlr', 'powerXlr', 'Analog', interconnect, '50360508743994', preampNote, false),
  rule('switchPort', 'network', 'Digital', network, '51593289892154', 'Connect a copper LAN port to the streamer’s Ethernet port. The linked 3 ft cable has RJ45 plugs at both ends.'),
  rule('phonoMmOut', 'phonoMmIn', 'Analog', phono, '52976877732154', 'Use the phono output and connect the separate ground lead. Choose moving magnet on the phono stage for the supplied cartridge. A stock RCA phono lead with ground also works. The linked Dragon is 3 ft.', false),
  rule('phonoMcOut', 'phonoMcIn', 'Analog', phono, '52976877732154', 'Connect the ground lead. Set the phono stage for the supplied moving-coil cartridge and its specified loading. The supplied phono cable also works. The linked Dragon is 3 ft.', false),
  rule('clockOut', 'clockIn', 'Digital', dualData, '49826481307962', 'Use both supplied BNC cables for word clock sync. For optional Dragon replacements, match the two clock connections with two BNC-to-BNC cables. The 3 ft product link is for one cable. Music travels on a separate connection.', false),
  rule('usPower', 'acIn', 'Power', mains, '50201008111930', 'For the US 120 V units shown, the supplied AC cord works. The 4 ft Dragon option has a grounded US wall plug and a 15 A IEC equipment end that fits this power supply’s AC inlet.', false),
  rule('speakerOut', 'passiveIn', 'Speaker', speakerCable, '51668250198330', speakerNote, false),
  rule('towerOut', 'towerIn', 'Speaker', speakerCable, '51668250198330', speakerNote, false),
  rule('monitorOut', 'monitorIn', 'Speaker', speakerCable, '51668250198330', speakerNote + ' Set the Yamaha’s speaker impedance for this 6-ohm model as directed in its manual.', false),
  rule('centerOut', 'centerIn', 'Speaker', speakerCable, '51668250198330', 'With the receiver off, run one cable from CENTER to the center speaker, red to red and black to black. The 6 ft listing is a stereo pair. Only one lead is used here.', false),
]

function endpoint(item, key) {
  return {
    brand: item.brand,
    model: item.model,
    port: item.portLabels[key] || labels[key],
    ...(item.listing ? { listing: item.listing } : {}),
  }
}
function slug(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function match(connection, from, to) {
  const [name, handle] = connection.cable
  const sourcePage = product(handle)
  const fromEndpoint = endpoint(from, connection.output)
  const toEndpoint = endpoint(to, connection.input)
  return {
    // Changing to a different factory configuration retires saved handoffs for the old choice.
    id: [fromEndpoint.brand, fromEndpoint.model, connection.output, toEndpoint.brand, toEndpoint.model, connection.input, connection.variant].map(slug).join('-'),
    from: fromEndpoint,
    to: toEndpoint,
    category: connection.category,
    name,
    url: sourcePage + '?variant=' + connection.variant,
    sources: [...new Set([from.source, to.source, sourcePage])],
    note: connection.note,
  }
}

export const systemMatches = rules.flatMap((connection) => {
  const sources = devices.filter((item) => item.ports.includes(connection.output))
  const receivers = devices.filter((item) => item.ports.includes(connection.input))
  return sources.flatMap((from) => receivers.filter((to) => to !== from).map((to) => match(connection, from, to)))
})

// These explicitly chosen roles work for unlisted gear only when the owner can
// identify both signals. They are separate from model-based results and counts.
export const systemPortMatches = rules.filter((connection) => connection.byPort).map((connection) => {
  const cablePage = product(connection.cable[1])
  const from = device('By port', labels[connection.output], null, [connection.output], cablePage)
  const to = device('By port', labels[connection.input], null, [connection.input], cablePage)
  return match(connection, from, to)
})
