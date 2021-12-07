export class RationalLiteral {
  private numerator: bigint;
  private denominator: bigint;

  constructor(numerator: bigint, denominator: bigint) {
    if (denominator > 0n) {
      this.numerator = numerator;
      this.denominator = denominator;
    } else if (denominator < 0n) {
      this.numerator = -numerator;
      this.denominator = -denominator;
    } else {
      throw new Error('Attempted rational division by 0');
    }
  }

  equalValueOf(other: RationalLiteral): boolean {
    return this.numerator * other.denominator === other.numerator * this.denominator;
  }

  greaterThan(other: RationalLiteral): boolean {
    return this.numerator * other.denominator > other.numerator * this.denominator;
  }

  add(other: RationalLiteral): RationalLiteral {
    if (this.denominator === other.denominator) {
      return new RationalLiteral(this.numerator + other.numerator, this.denominator);
    } else if (this.denominator % other.denominator === 0n) {
      // 6 % 3 === 0
      // 5/6 + 2/3 === 5+(2*6/3)/6
      return new RationalLiteral(
        this.numerator + (other.numerator * this.denominator) / other.denominator,
        this.denominator,
      );
    } else if (other.denominator % this.denominator === 0n) {
      return new RationalLiteral(
        other.numerator + (this.numerator * other.denominator) / this.denominator,
        other.denominator,
      );
    } else {
      return new RationalLiteral(
        this.numerator * other.denominator + other.numerator * this.denominator,
        this.denominator * other.denominator,
      );
    }
  }

  subtract(other: RationalLiteral): RationalLiteral {
    return this.add(new RationalLiteral(-other.numerator, other.denominator));
  }

  multiply(other: RationalLiteral): RationalLiteral {
    return new RationalLiteral(
      this.numerator * other.numerator,
      this.denominator * other.denominator,
    );
  }

  divideBy(other: RationalLiteral): RationalLiteral {
    // Division by 0 will cause the constructor to throw an error
    return new RationalLiteral(
      this.numerator * other.denominator,
      this.denominator * other.numerator,
    );
  }

  exp(other: RationalLiteral): RationalLiteral | null {
    const op = other.toInteger();
    if (op === null) {
      return null;
    }

    if (op === 0n) {
      return new RationalLiteral(1n, 1n);
    } else if (op > 0n) {
      return new RationalLiteral(this.numerator ** op, this.denominator ** op);
    } else if (this.numerator > 0n) {
      return new RationalLiteral(this.denominator ** -op, this.numerator ** -op);
    } else if (this.numerator < 0n) {
      return new RationalLiteral((-this.denominator) ** -op, (-this.numerator) ** -op);
    } else {
      return new RationalLiteral(0n, 1n);
    }
  }

  mod(other: RationalLiteral): RationalLiteral {
    //TODO test negative cases against remix
    return new RationalLiteral(
      (this.numerator * other.denominator) % (other.numerator * this.denominator),
      this.denominator * other.denominator,
    );
  }

  toInteger(): bigint | null {
    if (this.numerator % this.denominator === 0n) {
      return this.numerator / this.denominator;
    } else {
      return null;
    }
  }

  toString(): string {
    return `${this.numerator}/${this.denominator}`;
  }
}

export function stringToLiteralValue(value: string): RationalLiteral {
  const tidiedValue = value
    .split('')
    .filter((c) => c !== '_')
    .join('');

  if (tidiedValue.startsWith('0x')) {
    return intToLiteral(value);
  } else if (tidiedValue.includes('e')) {
    return scientificNotationToLiteral(value);
  } else if (tidiedValue.includes('.')) {
    return decimalToLiteral(value);
  } else {
    return intToLiteral(value);
  }
}

function intToLiteral(value: string): RationalLiteral {
  return new RationalLiteral(BigInt(value), 1n);
}

function decimalToLiteral(value: string): RationalLiteral {
  const parts = value.split('.', 2);
  //Remove leading zeros, but keep 1 if the int part is 0
  const intPart = parts[0].replace('/^0+/', '');
  //Remove trailing zeros
  const decimalPart = parts[1].replace('/0+$', '');

  if (intPart === '' && decimalPart === '') {
    return new RationalLiteral(0n, 1n);
  } else {
    return new RationalLiteral(
      BigInt(`${intPart}${decimalPart}`),
      BigInt(10n ** BigInt(decimalPart.length)),
    );
  }
}

function scientificNotationToLiteral(value: string): RationalLiteral {
  const parts = value.split('e', 2);
  const coefficient: RationalLiteral = parts[0].includes('.')
    ? decimalToLiteral(parts[0])
    : intToLiteral(parts[0]);
  const exponent: bigint = BigInt(parts[1]);
  console.log(parts[0]);
  console.log(parts[1]);
  console.log(coefficient.toString());
  console.log(exponent.toString());
  const rationalExponentFactor = new RationalLiteral(10n, 1n).exp(
    new RationalLiteral(exponent, 1n),
  );
  return coefficient.multiply(rationalExponentFactor);
}
