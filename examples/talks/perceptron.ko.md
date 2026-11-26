# Perceptron
Wonseok Jung

## Logical circuit
$$
y = 0 if w1x1 + w2x2 <= theta
1 if w1x1 + w2x2 > theta
$$
Note: 0 (w1x1 + w2x2 ≦ theta), 1 (w1x1 + w2x2 > theta)

## Truth Table – AND , NAND
Weight and Theta?
AND:
| x1 | x2 | y |
|---|---|---|
| 0 | 0 | 0 |
| 1 | 1 | 1 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |

NAND:
| x1 | x2 | y |
|---|---|---|
| 0 | 0 | 1 |
| 1 | 1 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |

## Truth Table – OR , NOR
Weight and Theta?
OR:
| x1 | x2 | y |
|---|---|---|
| 0 | 0 | 0 |
| 1 | 1 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |

NOR:
| x1 | x2 | y |
|---|---|---|
| 0 | 0 | 1 |
| 1 | 1 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |

## Perceptron with Weight and Bias
$$
y = 0 if bias + w1x1 + w2x2 <= 0
1 if bias + w1x1 + w2x2 > 0
$$
Note: 바이어스가 -1 일때 웨이트와 인풋의 곱이 1이 상인 0을 초과해야 1 리턴

## Activation function
H(x) 같이 입력 신호의 총합을 출력 신호로 변환하는 함수를 활성화 함수라고 한다
$$
h(x) = 0 if x <= 0
1 if x > 0
$$
plot: step, sigmoid, relu

## 3 layer Neural Network
Input layer [x1 x2] -> Hidden layer [a1 a2 a3] -> Output layer [y1 y2]

## 3 layer Neural Network -2
$$ A = XW + B $$
- A: ( a1 a2 a3 )
- X: ( x1 x2 )
- B: ( b1 b2 b3 )
Note: a1 = w1x1 + w2x2 + b. DeepLearning from scratch - Orelly

## 3 layer Neural Network -3
a1( WX+b ) -> h( ) -> z
Note: h( ) 는 activation function

## 3 layer Neural Network -4
Output Layer에는 보통 **Softmax** Function 을 사용한다.
Note: σ( ). Output Total value가 1이 되기 때문에 Softmax function 을 사용한 output 을 확률로 계산할 수 있다.
