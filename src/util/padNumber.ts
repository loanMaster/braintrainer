export function padNumber(input: number, size: number) {
  let num = input.toString();
  while (num.length < size) {
    num = '0' + num;
  }
  return num;
}
