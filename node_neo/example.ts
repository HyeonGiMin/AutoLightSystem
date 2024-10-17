import { colorwheel, StripType, ws281x } from 'piixel';
import { Gpio } from 'pigpio';  // pigpio 라이브러리에서 Gpio 가져오기

// NeoPixel 설정
const LEDS = 28;  // LED의 수
ws281x.configure({
  gpio: 18,  // GPIO 18번 핀에 연결
  leds: LEDS,
  type: StripType.WS2812_STRIP,
});

const pixels = new Uint32Array(LEDS);
const delayTime = 3000;


// 디바운싱 변수 설정
let lastAlertTime = 0;
const debounceDelay = 2000; // 2초

// PIR 센서 핀 설정
const pirSensor = new Gpio(17, { mode: Gpio.INPUT, alert: true });  // PIR 센서를 17번 핀에 연결

// 특정 시간대에 LED 켜기
function isWithinTimeRange(startHour: number, endHour: number) {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= startHour && currentHour < endHour;
}

// NeoPixel LED 켜기
function turnOnNeoPixel() {
  if (!isWithinTimeRange(18, 24)) { // 오전 6시부터 오후 6시까지
    console.log('지정된 시간대가 아닙니다. LED를 켜지 않습니다.');
    return; // 지정된 시간대가 아닐 경우 LED를 켜지 않음
  }
  console.log("ON LED")
  for (let i = 0; i < LEDS; i++) {
    pixels[i] = colorwheel((i * 256) / LEDS);  // 다양한 색상 설정
  }
  ws281x.render(pixels);  // 색상 전송

    // 3초 후에 LED 끄기
    setTimeout(turnOffNeoPixel, delayTime);
}

// NeoPixel LED 끄기
function turnOffNeoPixel() {
  console.log("OFF LED")
  for (let i = 0; i < LEDS; i++) {
    pixels[i] = 0;  // LED 끄기
  }
  ws281x.render(pixels);  // 색상 전송
}

// PIR 센서가 움직임을 감지했을 때 이벤트 핸들러
pirSensor.on('alert', (level) => {
  const currentTime = Date.now();
  
  // 디바운싱 처리
  if (level === 1 && (currentTime - lastAlertTime) > debounceDelay) {  
    console.log('움직임 감지!');
    turnOnNeoPixel();  // NeoPixel 켜기
    lastAlertTime = currentTime; // 마지막 감지 시간 업데이트
  }
});

// 종료 시 처리
process.on('SIGINT', () => {
  for (let i = 0; i < LEDS; i++) {
    pixels[i] = 0;  // LED 끄기
  }
  ws281x.render(pixels);  // 색상 전송
  process.exit();
});
console.log("Start")
// turnOnNeoPixel();