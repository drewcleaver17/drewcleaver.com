// Source-reviewed exceptions for the conventional headphone-cable path.
// A block on that path still permits a separately documented system link.
const rules = [
  {
    handles: ['crbn-electrostatic-headphones-2'],
    blockHeadphone: true,
    note: 'The CRBN2 has an attached five-pin cable. Use a 580 V Stax Pro Bias electrostatic output. Ask about the energizer if you are changing amplifiers.',
    source: 'https://www.audeze.com/products/crbn2',
  },
  {
    handles: ['dan-clark-audio-corina-reference-electrostatic-headphone'],
    blockHeadphone: true,
    note: 'CORINA uses a dedicated electrostatic cable and amplifier. Keep its existing cable in place while an advisor checks your electrostatic amplifier.',
    source: 'https://danclarkaudio.com/corina.html',
  },
  {
    handles: ['warwick-acoustics-aperio'],
    blockHeadphone: true,
    blockAmp: true,
    note: 'Warwick pairs the APERIO headphones exclusively with the APERIO energizer. Use this system together. Source cables connect to the inputs on the APERIO electronics.',
    source: 'https://warwickacoustics.com/headphones/collection/aperio/',
  },
  {
    handles: ['raal-ca-1a-headphones'],
    blockHeadphone: true,
    note: 'For a conventional four-pin XLR headphone amp, the CA-1a package uses a TI-1b interface. The HPL cable runs from the amp to the interface. The SC2 runs from the interface to the ribbon headphones. Check which parts you own.',
  },
  {
    handles: ['raal-sr1a-ribbon-headphone-with-interface'],
    blockHeadphone: true,
    note: 'The SR1a requires a dedicated ribbon drive or the matching RAAL interface. Identify your interface or ribbon amplifier before choosing a cable. A four-pin XLR socket alone cannot establish this fit.',
  },
  {
    handles: ['headamp-blue-hawaii-electrostatic-headphone-amplifier'],
    blockAmp: true,
    note: 'The Blue Hawaii SE has two 580 V Stax Pro Bias electrostatic headphone outlets. Use it with a matching electrostatic headset and its dedicated cable.',
    source: 'https://www.headamp.com/products/blue-hawaii-se',
  },
  {
    handles: ['ifi-ican-phantom-reference-class-analog-headphone-amplifier'],
    note: 'The iCAN PHANTOM 1.5 has separate conventional and electrostatic headphone sockets. For a Dragon headphone cable, use the conventional output on the selected build. An electrostatic headset needs the correct socket and bias for that model.',
    source: 'https://ifi-audio.com/products/ican-phantom-1-5',
  },
  {
    handles: ['wf-1000xm6-the-best-truly-wireless-noise-cancelling-earbuds'],
    blockHeadphone: true,
    note: 'WF-1000XM6 are true wireless earbuds. Music reaches them over Bluetooth, and the USB-C cable charges their case. WH-1000XM6 is a different, over-ear model.',
    source: 'https://helpguide.sony.net/mdr/2985/v1/en/print.pdf',
  },
  {
    handles: ['audeze-maxwell-2-anc-planar-gaming-headphones'],
    note: 'For 3.5 mm wired listening, use the AUX socket on the bottom near the volume controls. The recessed front socket of the same size accepts the boom microphone.',
    source: 'https://support.audeze.com/hc/en-us/articles/47463923098125-Maxwell-2-ANC-User-Guide-Wired-Connections',
  },
  {
    handles: ['hdb-630-closed-back-wireless-headphones'],
    note: 'For a source with a 3.5 mm headphone jack, use the supplied audio cable. USB-C and Bluetooth are separate listening options.',
  },
  {
    handles: ['oae2-open-back-headphones'],
    note: 'OAE2 uses four-contact 2.5 mm earcup sockets, with single- and double-sided wiring options. Its supplied cords cover a 3.5 mm jack (or 6.35 mm with the adapter) and a balanced 4.4 mm jack.',
  },
  {
    handles: ['sennheiser-ie-600-iems'],
    note: 'The IE 600 has recessed Fidelity+ MMCX sockets. A replacement needs the correct housing clearance. The supplied cables cover 3.5 mm and balanced 4.4 mm headphone jacks.',
  },
  {
    handles: ['sennheiser-ie900'],
    note: 'The IE 900 has recessed Fidelity+ MMCX sockets. Check the housing clearance on a replacement. Cables for 2.5 mm, 3.5 mm and 4.4 mm jacks come with the earphones.',
  },
  {
    handles: ['bricasti-design-m3-dac'],
    note: 'Read the edition on your unit. The M3h includes the headphone amplifier and front headphone jacks. The M3 DAC version feeds a separate amplifier.',
  },
  {
    handles: ['chord-mojo-dac-headphone-amp'],
    note: 'Check which Mojo 2 you own. The revised unit has one 3.5 mm and one 4.4 mm headphone jack. The earlier unit has two 3.5 mm jacks. Use the headphone side, away from the coaxial digital input.',
    source: 'https://chordelectronics.co.uk/the-mojo-2-gets-key-updates',
  },
  {
    handles: ['dcs-lina-full-system'],
    note: 'In this three-unit system, the headphones plug into the Lina Headphone Amplifier. The Master Clock and Network DAC have different jobs. Select the amplifier when choosing a headphone cable.',
  },
  {
    handles: ['naim-uniti-atom-headphone-amp-dac-and-streamer'],
    note: 'Check the edition on your unit. Moon lists Uniti Atom Speaker Edition and Headphone Edition together. Choose the matching model and its headphone socket before ordering a cable.',
  },
  {
    handles: ['ifi-go-pod-max-wearable-lossless-hd-bluetooth-dac-and-headphone-amp'],
    blockAmp: true,
    note: 'GO pod and GO pod Max drive each earpiece through a model-specific ear loop. Match the loop to the IEM connector. The pods take the place of a wired headphone cable.',
  },
  {
    handles: ['pd10-cradle'],
    blockAmp: true,
    note: 'The dock’s XLR outputs send a line-level signal to an amplifier or powered monitors. For headphones, select the player itself and choose a headphone jack on that model.',
  },
  {
    handles: ['chord-qutest-dac'],
    blockAmp: true,
    note: 'Qutest sends analog audio to a separate amplifier. Match the headphones to a jack on that amplifier. For the cable between the Qutest and your amp, select those two components.',
    source: 'https://chordelectronics.co.uk/product/qutest',
  },
  {
    handles: ['chord-hugo-m-scaler', 'quartet-fpga-upscaler'],
    blockAmp: true,
    note: 'This upscaler feeds a compatible DAC. For a headphone cable, identify the amplifier or DAC/amp that the headphones plug into.',
  },
  {
    handles: ['bathys-mg-wireless-headphones'],
    note: 'Bathys MG needs battery power for wired and wireless listening. Its analog path uses a 3.5 mm jack. For digital listening, use the USB-C DAC mode.',
    source: 'https://www.focal.com/products/bathys-mg',
  },
  {
    handles: ['bricasti-m15', 'bricasti-m18-dual-mono-amplifier', 'bricasti-m28-monoblock-amplifier', 'chord-choral-etude-amp', 'nad-m23-v2-stereo-power-amplifier'],
    blockAmp: true,
    note: 'The speaker power outputs drive loudspeakers. For regular headphones, select the headphone amplifier. For a specialist ribbon interface, identify the interface model as well.',
  },
  {
    handles: ['pass-labs-x150-8-amplifier', 'pass-labs-x250-8-stereo-amplifier', 'pass-labs-xa30-8-stereo-power-amplifier', 'pass-labs-xa60-8-monoblock-amplifier-pair', 'xa160-8-amplifier'],
    blockAmp: true,
    note: 'Both loudspeaker output terminals are live on this Point 8 amplifier. Use a dedicated headphone amplifier for regular headphones. A ribbon or subwoofer interface needs its manufacturer’s wiring instructions.',
    source: 'https://www.passlabs.com/wp-content/uploads/2020/10/Point-8-OM_200924.pdf',
  },
  {
    handles: ['teac-pd-507t-cd-transport', 'vrds-701t-cd-transport'],
    blockAmp: true,
    note: 'This CD transport sends a digital signal to a separate DAC. To choose a listening cable, select the headphone amplifier downstream of that DAC.',
  },
  {
    handles: ['usb-multiplexer-for-suzi-hugo-2'],
    blockAmp: true,
    note: 'The multiplexer adds digital USB and charging connections to the Hugo 2 and Suzi setup. Select the Hugo 2 to identify its headphone jack.',
  },
  {
    handles: ['aurender-nh10-audiophile-network-switch', 'ss-1-pro-audio-grade-network-switch', 'ifi-omni-lan'],
    blockAmp: true,
    note: 'This switch connects network devices. A network cable carries data to the streamer. For a headphone cable, identify the amplifier that drives the headphones.',
  },
  {
    handles: ['si-1-audio-grade-network-isolator'],
    blockAmp: true,
    note: 'SI-1 is a network isolator. It sits in the network connection to your audio system. Select your headphone amplifier to match a headphone cable.',
  },
  {
    handles: ['ifi-omni-usb-optical-isolation-zero-disruption', 'su-1-isolated-usb-switcher-with-linear-psu-moon-audio'],
    blockAmp: true,
    note: 'This device connects USB equipment digitally. Follow the connection downstream to the DAC and headphone amplifier to identify the headphone jack.',
  },
  {
    handles: ['cardas-nautilus-power-strip'],
    blockAmp: true,
    note: 'Nautilus distributes AC power. Its small jack beside the IEC inlet is an external grounding point. For a listening cable, select your headphone amplifier.',
  },
  {
    handles: ['hypsos-hybrid-power-supply', 'hypsos-dual-amplifier', 'watson-madison-power-supply', 'ifi-ipower-elite-power-supply'],
    blockAmp: true,
    note: 'This is an external DC power supply. Match its power lead to the receiving equipment. Identify the amplifier separately for a headphone cable.',
  },
  {
    handles: ['dc-blocker', 'ifi-powerstation-active-noise-cancellation', 'rm-15', 'rm-20', 'tot-avr', 'tot-max-power'],
    blockAmp: true,
    note: 'This unit handles AC power for other equipment. For a headphone cable, choose the amplifier that the headphones plug into.',
  },
  {
    handles: ['tronsmart-usb-charger'],
    blockAmp: true,
    note: 'This USB charger supplies power. For USB audio, choose the music source and its DAC. For headphones, choose the headphone amplifier.',
  },
  {
    handles: ['dcs-lina-master-clock', 'g-05-master-clock', 'matrix-audio-sc-1-audio-grade-reference-clock', 'teac-cg-10m-a-master-clock-generator', 'cg-10m-master-clock-generator-open-box'],
    blockAmp: true,
    note: 'These timing outputs synchronize compatible audio equipment. Check clock format, frequency and impedance at both ends. For headphones, choose a jack on the amplifier.',
  },
  {
    handles: ['m23-measurement-mic', 'm30-measurement-mic', 'm50-measurement-mic'],
    blockAmp: true,
    note: 'This is a measurement microphone. It feeds a microphone input on recording or measurement equipment. Select the headphone amplifier for a listening cable.',
  },
]

// Technics specifically supplies the phono signal and ground leads for these decks.
const technicsManuals = [
  ['sl-1200gme-sl-1210gme-master-edition-direct-drive-turntable','https://eww.pavc.panasonic.co.jp/audiooi/technics/sl_1200gme_1210gme/sl_1200gmee_1210gmee_dvqx2821za_x1_basic_en_de_fr_it_etc_s.pdf'],
  ['technics-sl-1210gr2-direct-drive-turntable-system-ii','https://eww.pavc.panasonic.co.jp/audiooi/technics/sl_1200gr2_1210gr2/sl_1200gr2e_1210gr2e_tqbm0907_basic_en_ge_fr_sp_etc_s.pdf'],
  ['technics-sl-1300g-k-grand-class-turntable','https://eww.pavc.panasonic.co.jp/audiooi/technics/sl_1300g/sl_1300geg_dvqx2881za_x1_basic_en_de_fr_it_etc_s.pdf'],
  ['sl-1500c-k-direct-drive-turntable-system','https://help.na.panasonic.com/wp-content/uploads/2023/02/SL1500_TQBM0415_ENG_FRE.pdf'],
]
for (const [handle,source] of technicsManuals) rules.push({
  handles:[handle], source, included:true,
  note:'Use the supplied phono cable and earth lead for the phono connection specified in the Technics manual.',
})

export const cautions = Object.fromEntries(rules.flatMap(({ handles, ...rule }) =>
  handles.map(handle => [handle, {
    source: 'https://www.moon-audio.com/products/' + handle,
    ...rule,
  }]),
))
