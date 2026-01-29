void setup() {
  Serial.begin(115200); // 반드시 115200 보드레이트로 설정!
  randomSeed(analogRead(0)); // 난수 초기화
}

float currentDepth = 0.0;
float depthDirection = 0.1; // 0.1m씩 변화
float maxTestDepth = 25.0; // 테스트 최대 수심

void loop() {
  // 1. Voltage (12.0V ~ 12.5V 사이를 임의로 변화)
  float voltage = 12.0 + (random(0, 50) / 100.0); // 0.00 ~ 0.49V 추가

  // 2. Depth (점점 깊어졌다가 얕아지는 시뮬레이션)
  currentDepth += depthDirection;
  if (currentDepth > maxTestDepth || currentDepth < 0.0) {
    depthDirection *= -1; // 방향 전환
    currentDepth = constrain(currentDepth, 0.0, maxTestDepth); // 범위 유지
  }

  // 3. O2 (산소 농도, 70% ~ 90% 사이를 임의로 변화)
  float o2 = 70.0 + (random(0, 200) / 10.0); // 0.0 ~ 19.9% 추가

  // 4. Status (0: 정상, 1: 경고) - 가끔 경고 발생
  int status = (random(0, 100) < 5) ? 1 : 0; // 5% 확률로 경고

  // CSV 형식으로 출력: Voltage,Depth,O2,Status\n
  Serial.print(voltage);
  Serial.print(",");
  Serial.print(currentDepth);
  Serial.print(",");
  Serial.print(o2);
  Serial.print(",");
  Serial.println(status); // println이 줄바꿈(\n)을 포함

  delay(1000); // 1초마다 데이터 전송
}
