import { UserError } from "./exceptions";

function factorial(n: number): number {
  let res = n;
  if (n === 0 || n === 1) res = 1;
  else {
    while (n > 1) {
      n -= 1;
      res *= n;
    }
  }
  return res;
}

function combination(n: number, r: number): number {
  if (n < r) throw new UserError(6743);
  if (n === r) return 1;

  return factorial(n) / (factorial(r) * factorial(n - r));
}

function permutation(n: number, r: number): number {
  if (n < r) throw new UserError(7453);
  if (n === r) return 1;

  return factorial(n) / factorial(n - r);
}

export { factorial, combination, permutation };
