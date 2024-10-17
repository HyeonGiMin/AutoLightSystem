import time
from datetime import datetime
import RPi.GPIO as GPIO
from rpi_ws281x import PixelStrip, Color

# NeoPixel 설정
LED_COUNT = 28       # 네오픽셀 LED 수
LED_PIN = 18        # GPIO 핀 (PWM 가능 핀 사용)
LED_FREQ_HZ = 800000  # LED 신호 주파수 (Hz)
LED_DMA = 10        # DMA 채널 (하드웨어 제약에 따라 다름)
LED_BRIGHTNESS = 255  # 밝기 (0~255)
LED_INVERT = False  # 신호 반전 여부
LED_CHANNEL = 0     # 채널 (PWM 사용 시 0 또는 1)

# PIR 센서 설정
PIR_PIN = 17

# 동작 시간 설정 (24시간 형식, 예: 08:00 ~ 18:00)
START_TIME = "08:00"
END_TIME = "23:00"

# NeoPixel 초기화
strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
strip.begin()

# GPIO 설정
GPIO.setmode(GPIO.BCM)
GPIO.setup(PIR_PIN, GPIO.IN)

# 네오픽셀 전체 켜기 함수
def turn_on_pixels(color):
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
    strip.show()

# 네오픽셀 전체 끄기 함수
def turn_off_pixels():
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, Color(0, 0, 0))
    strip.show()

# 시간 체크 함수
def is_within_time_range(start_time, end_time):
    now = datetime.now().time()
    start = datetime.strptime(start_time, "%H:%M").time()
    end = datetime.strptime(end_time, "%H:%M").time()
    return start <= now <= end

try:
    while True:
        # PIR 센서가 동작하고, 지정된 시간 내에 있을 때만 작동
        if GPIO.input(PIR_PIN) and is_within_time_range(START_TIME, END_TIME):
            print("움직임 감지됨! 네오픽셀 켬")
            turn_on_pixels(Color(255, 0, 0))  # 빨간색 네오픽셀 켜기
            time.sleep(5)  # 5초 대기
            turn_off_pixels()  # 네오픽셀 끄기
            print("네오픽셀 끔")

        time.sleep(1)  # 1초마다 PIR 센서 감지

except KeyboardInterrupt:
    GPIO.cleanup()
    turn_off_pixels()
