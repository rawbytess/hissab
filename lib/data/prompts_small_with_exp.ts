const prompts_with_exp = [
  {
    prompt: "What is 25 plus 78?",
    hissab_expressions: ["25+78"],
  },
  {
    prompt: "Subtract 512 from 1024.",
    hissab_expressions: ["1024-512"],
  },
  {
    prompt: "Multiply 24 by 6.",
    hissab_expressions: ["24*6"],
  },
  {
    prompt: "Divide 1000 by 25.",
    hissab_expressions: ["1000/25"],
  },
  {
    prompt: "What is 7 factorial?",
    hissab_expressions: ["7!"],
  },
  {
    prompt: "Find 12 mod 5.",
    hissab_expressions: ["12 mod 5"],
  },
  {
    prompt: "What is the absolute value of -456?",
    hissab_expressions: ["abs(-456)"],
  },
  {
    prompt: "What is 9 squared?",
    hissab_expressions: ["9^2"],
  },
  {
    prompt: "Calculate the cube root of 729.",
    hissab_expressions: ["729^(1/3)"],
  },
  {
    prompt: "Find the natural logarithm of 50.",
    hissab_expressions: ["log 50"],
  },
  {
    prompt: "Find log base 2 of 256.",
    hissab_expressions: ["log2 256"],
  },
  {
    prompt: "Compute log base 10 of 1000.",
    hissab_expressions: ["log10 1000"],
  },
  {
    prompt: "What is 15% of 250?",
    hissab_expressions: ["15% of 250"],
  },
  {
    prompt: "Apply a 20% discount to 500 dollars.",
    hissab_expressions: ["$500 - 20%"],
  },
  {
    prompt: "Add 10% to 450.",
    hissab_expressions: ["10% + 450"],
  },
  {
    prompt: "If 40% of a number is 200, what is the original number?",
    hissab_expressions: ["40% of what is 200"],
  },
  {
    prompt: "Convert 15 kilometers to miles.",
    hissab_expressions: ["15 kilometers to miles"],
  },
  {
    prompt: "How many inches are in 3 feet?",
    hissab_expressions: ["3 feet to inches"],
  },
  {
    prompt: "Convert 5 liters to gallons.",
    hissab_expressions: ["5 liters to gallons"],
  },
  {
    prompt: "Convert 100 Fahrenheit to Celsius.",
    hissab_expressions: ["100 Fahrenheit to Celsius"],
  },
  {
    prompt: "Convert 256 grams to ounces.",
    hissab_expressions: ["256 grams to ounces"],
  },
  {
    prompt: "Convert 45 degrees to radians.",
    hissab_expressions: ["45 degrees to radians"],
  },
  {
    prompt: "Convert 10 terabytes to gigabytes.",
    hissab_expressions: ["10 terabytes to gigabytes"],
  },
  {
    prompt: "Find the maximum of these numbers: 5, 12, 48, 3, and 102.",
    hissab_expressions: ["max(5, 12, 48, 3, 102)"],
  },
  {
    prompt: "Find the minimum of these numbers: 78, 102, 5, 9, 12.",
    hissab_expressions: ["min(78, 102, 5, 9, 12)"],
  },
  {
    prompt: "Find the least common multiple of 8, 12, and 20.",
    hissab_expressions: ["lcm(8, 12, 20)"],
  },
  {
    prompt: "Find the greatest common divisor of 48 and 60.",
    hissab_expressions: ["gcd(48, 60)"],
  },
  {
    prompt: "How many ways can I choose 4 students from a class of 10?",
    hissab_expressions: ["10 comb 4"],
  },
  {
    prompt: "In how many ways can I arrange 5 different books on a shelf?",
    hissab_expressions: ["5!"],
  },
  {
    prompt: "Find the average of 45, 56, 67, 78, 89.",
    hissab_expressions: ["avg(45, 56, 67, 78, 89)"],
  },
  {
    prompt: "Find the standard deviation of 12, 15, 18, 25, 30.",
    hissab_expressions: ["standard deviation(12, 15, 18, 25, 30)"],
  },
  {
    prompt: "Calculate the variance of 45, 56, 67, 78, 89.",
    hissab_expressions: ["variance(45, 56, 67, 78, 89)"],
  },
  {
    prompt: "Find the median of 22, 34, 50, 12, 48, 78.",
    hissab_expressions: ["median(22, 34, 50, 12, 48, 78)"],
  },
  {
    prompt: "What is the sine of 30 degrees?",
    hissab_expressions: ["sin 30 degrees"],
  },
  {
    prompt: "Calculate cosine of 60 degrees.",
    hissab_expressions: ["cos 60 degrees"],
  },
  {
    // TODO
    prompt: "Compute tangent of π/4 radians.",
    hissab_expressions: ["tan (pi/4) radians"],
  },
  {
    prompt: "What date is 10 days after January 1, 2023?",
    hissab_expressions: ["January 1 2023 + 10 days"],
  },
  {
    // TODO Comma not supported in date
    prompt: "How many days are between July 4, 2022, and December 25, 2022?",
    hissab_expressions: ["July 4 2022 - December 25 2022 to days"],
  },
  {
    prompt: "If I was born on March 5, 1995, how old am I today?",
    hissab_expressions: ["today - March 5 1995 to years"],
  },
  {
    prompt: "Convert 1672531199 to human-readable date.",
    hissab_expressions: ["1672531199 to human date"],
  },
  {
    prompt: "Convert the binary number 101101 to decimal.",
    hissab_expressions: ["0b101101 to decimal"],
  },
  {
    prompt: "Convert 0x3FA to binary.",
    hissab_expressions: ["0x3FA to binary"],
  },
  {
    prompt: "Add 0b1010 and 0x1F4 and convert the result to octal.",
    hissab_expressions: ["(0b1010 + 0x1F4) to octal"],
  },
  {
    prompt: "Perform a bitwise AND on 45 and 23.",
    hissab_expressions: ["45 & 23"],
  },
  {
    prompt: "Compute 56 OR 89.",
    hissab_expressions: ["56 | 89"],
  },
  {
    prompt: "Perform a left shift on 200 by 3 bits.",
    hissab_expressions: ["200 << 3"],
  },
  {
    prompt: "Convert the hex color #ff5733 to RGB format.",
    hissab_expressions: ["#ff5733 to rgb color"],
  },
  {
    prompt: "Mix the colors red and blue.",
    hissab_expressions: ["red + blue"],
  },
  {
    prompt: "Find the complementary color of yellow.",
    hissab_expressions: ["~yellow"],
  },
  {
    prompt: "Find the darker shade of #aabbcc by 20%.",
    hissab_expressions: ["#aabbcc + 1.2"],
  },
  {
    prompt: "Calculate 123 plus 456 minus 78.",
    hissab_expressions: ["123+456-78"],
  },
  {
    // TODO more complex arithmetic examples
    prompt: "What is 10 multiplied by 5 divided by 2?",
    hissab_expressions: ["10*5/2"],
  },
  {
    prompt: "What is 2 to the power of 8?",
    hissab_expressions: ["2^8"],
  },
  {
    prompt: "Find the square root of 625.",
    hissab_expressions: ["625^(1/2)"],
  },
  {
    prompt: "Calculate 7 factorial.",
    hissab_expressions: ["7!"],
  },
  {
    prompt: "What is 17 modulo 5?",
    hissab_expressions: ["17 mod 5"],
  },
  {
    prompt: "Find the absolute value of negative 345.",
    hissab_expressions: ["abs(-345)"],
  },
  {
    // TODO more percentage mix examples
    prompt: "What is 30 percent of 500?",
    hissab_expressions: ["30% of 500"],
  },
  {
    prompt: "Calculate a discount of 20% from 800.",
    hissab_expressions: ["800 - 20%"],
  },
  {
    prompt: "What is 60 percent plus 200?",
    hissab_expressions: ["60% + 200"],
  },
  {
    prompt: "25% of what is 100?",
    hissab_expressions: ["25% of what is 100"],
  },
  {
    prompt: "Convert 10 miles to kilometers.",
    hissab_expressions: ["10 miles to kilometers"],
  },
  {
    // TODO More unit breakdown examples
    prompt: "How many yards, feet, and inches are in 5 miles?",
    hissab_expressions: ["5 miles to yards, feet, inches"],
  },
  {
    prompt: "Add 5 kilograms to 10 pounds.",
    hissab_expressions: ["5 kilograms + 10 pounds"],
  },
  {
    prompt: "convert 20 litre to gallon.",
    hissab_expressions: ["20 litre to gallon"],
  },
  {
    prompt: "convert 30 degree celsius to fahrenheit.",
    hissab_expressions: ["30 degree celsius to fahrenheit"],
  },
  {
    prompt: "convert 1 ton to gram.",
    hissab_expressions: ["1 ton to gram"],
  },
  {
    prompt: "convert 180 degree to radian.",
    hissab_expressions: ["180 degree to radian"],
  },
  {
    prompt: "convert 8 byte to bit.",
    hissab_expressions: ["8 byte to bit"],
  },
  {
    prompt: "convert 2 year to minute.",
    hissab_expressions: ["2 year to minute"],
  },
  {
    prompt: "convert 10 mega meter to kilometer.",
    hissab_expressions: ["10 mega meter to kilometer"],
  },
  {
    prompt: "What is the maximum of 100, 200, and 150?",
    hissab_expressions: ["max(100, 200, 150)"],
  },
  {
    prompt: "What is the minimum of 100, 200, and 150?",
    hissab_expressions: ["min(100, 200, 150)"],
  },
  {
    prompt: "Calculate the least common multiple of 12, 18, and 24.",
    hissab_expressions: ["lcm(12, 18, 24)"],
  },
  {
    prompt: "Calculate the greatest common divisor of 12, 18, and 24.",
    hissab_expressions: ["gcd(12, 18, 24)"],
  },
  {
    prompt: "How many permutations of 5 items taken 3 at a time?",
    hissab_expressions: ["5 perm 3"],
  },
  {
    prompt: "How many combinations of 5 items taken 3 at a time?",
    hissab_expressions: ["5 comb 3"],
  },
  {
    prompt: "What is the natural logarithm of 10?",
    hissab_expressions: ["log 10"],
  },
  {
    prompt: "What is the base 10 logarithm of 100?",
    hissab_expressions: ["log10 100"],
  },
  {
    prompt: "What is the base 2 logarithm of 8?",
    hissab_expressions: ["log2 8"],
  },
  {
    prompt: "What is the average of 10, 20, 30, 40, and 50?",
    hissab_expressions: ["avg(10, 20, 30, 40, 50)"],
  },
  {
    prompt: "What is the harmonic mean of 2, 4, and 8?",
    hissab_expressions: ["harmonic mean(2, 4, 8)"],
  },
  {
    prompt: "What is the geometric mean of 2, 8, and 32?",
    hissab_expressions: ["geometric mean(2, 8, 32)"],
  },
  {
    prompt: "What is the standard deviation of 1, 2, 3, 4, 5?",
    hissab_expressions: ["standard deviation(1, 2, 3, 4, 5)"],
  },
  {
    prompt: "What is the variance of 1, 2, 3, 4, 5?",
    hissab_expressions: ["variance(1, 2, 3, 4, 5)"],
  },
  {
    prompt: "What is the median of 1, 3, 2, 5, 4?",
    hissab_expressions: ["median(1, 3, 2, 5, 4)"],
  },
  {
    prompt: "What is the range of 1, 2, 3, 4, 5?",
    hissab_expressions: ["range(1, 2, 3, 4, 5)"],
  },
  {
    prompt: "What is the sine of 30 degrees?",
    hissab_expressions: ["sin 30 degrees"],
  },
  {
    prompt: "What is the cosine of 60 degrees?",
    hissab_expressions: ["cos 60 degrees"],
  },
  {
    prompt: "What is the tangent of 45 degrees?",
    hissab_expressions: ["tan 45 degrees"],
  },
  {
    // TODO pi
    prompt: "What is the secant of pi/4 radians?",
    hissab_expressions: ["sec (pi/4) radians"],
  },
  {
    prompt: "What date is 7 days after 2023.10.26?",
    hissab_expressions: ["2023.10.26 + 7 days"],
  },
  {
    prompt: "What date was 10 days before 2023.10.26?",
    hissab_expressions: ["2023.10.26 - 10 days"],
  },
  {
    prompt: "How many hours are between 2023.10.26 and 2023.10.28?",
    hissab_expressions: ["2023.10.26 - 2023.10.28 to hours"],
  },
  {
    prompt: "Calculate age from 1995.05.15.",
    hissab_expressions: ["today - 1995.05.15 to years"],
  },
  {
    prompt: "Convert 2023.10.26 12:00:00 to unix epoch.",
    hissab_expressions: ["2023.10.26 12:00:00 to epoch"],
  },
  {
    prompt: "Convert 1677600000 to human date.",
    hissab_expressions: ["1677600000 to human date"],
  },
  {
    prompt: "What is the current time in Tokyo?",
    hissab_expressions: ["now in Tokyo"],
  },
  {
    prompt: "Convert 3:00 pm pst to est.",
    hissab_expressions: ["3:00 pm pst in est"],
  },
  {
    prompt: "Convert binary 1101 to decimal.",
    hissab_expressions: ["0b1101 to decimal"],
  },
  {
    prompt: "Calculate binary 1101 plus hexadecimal 1A.",
    hissab_expressions: ["0b1101 + 0x1A"],
  },
  {
    prompt: "What is the NOT of binary 0101?",
    hissab_expressions: ["~0b0101"],
  },
  {
    prompt: "Calculate 10 AND 5.",
    hissab_expressions: ["10 & 5"],
  },
  {
    prompt: "Calculate 10 OR 5.",
    hissab_expressions: ["10 | 5"],
  },
  {
    prompt: "Calculate 10 XOR 5.",
    hissab_expressions: ["10 xor 5"],
  },
  {
    prompt: "Right shift 16 by 2 bits.",
    hissab_expressions: ["16 >> 2"],
  },
  {
    prompt: "Add 15, 27 and 39",
    hissab_expressions: ["15+27+39"],
  },
  {
    prompt: "Multiply 12 by 15 and subtract 25",
    hissab_expressions: ["(12*15)-25"],
  },
  {
    prompt: "What is 5 to the power of 4 plus 10 factorial?",
    hissab_expressions: ["5^4 + 10!"],
  },
  {
    prompt: "Absolute value of -345 plus 200",
    hissab_expressions: ["abs(-345) + 200"],
  },
  {
    prompt: "Calculate 30% of 4500",
    hissab_expressions: ["30% of 4500"],
  },
  {
    prompt: "What is 1500 minus 25% discount?",
    hissab_expressions: ["1500 - 25%"],
  },
  {
    prompt: "If 40% of a number is 120, what is the number?",
    hissab_expressions: ["40% of what is 120"],
  },
  {
    prompt: "Add 15% to 780",
    hissab_expressions: ["15% + 780"],
  },
  {
    prompt: "Convert 5 feet to inches",
    hissab_expressions: ["5 feet to inches"],
  },
  {
    prompt: "How many miles is 42 kilometers?",
    hissab_expressions: ["42 kilometers to miles"],
  },
  {
    prompt: "Convert 3 gallons to liters",
    hissab_expressions: ["3 gallons to liters"],
  },
  {
    prompt: "Convert 98°F to Celsius",
    hissab_expressions: ["98 Fahrenheit to Celsius"],
  },
  {
    prompt: "Break down 2.5 miles into yards, feet and inches",
    hissab_expressions: ["2.5 miles to yards, feet, inches"],
  },
  {
    prompt: "Add 5 kilograms and 3 pounds",
    hissab_expressions: ["5 kilograms + 3 pounds"],
  },
  {
    prompt: "Find the maximum of 15, 78, 23, and 91",
    hissab_expressions: ["max(15, 78, 23, 91)"],
  },
  {
    prompt: "Least common multiple of 12, 15 and 20",
    hissab_expressions: ["lcm(12, 15, 20)"],
  },
  {
    prompt: "How many combinations of 5 items from 12?",
    hissab_expressions: ["12 comb 5"],
  },
  {
    prompt: "Number of permutations for 3 items from 8",
    hissab_expressions: ["8 perm 3"],
  },
  {
    prompt: "Natural log of 50",
    hissab_expressions: ["log 50"],
  },
  {
    prompt: "Log base 10 of 1000",
    hissab_expressions: ["log10 1000"],
  },
  {
    prompt: "Sine of 45 degrees",
    hissab_expressions: ["sin 45 degrees"],
  },
  {
    // TODO: pi
    prompt: "Tangent of π/4 radians",
    hissab_expressions: ["tan (pi/4) radians"],
  },
  {
    prompt: "Average of 15, 78, 23, 91",
    hissab_expressions: ["avg(15, 78, 23, 91)"],
  },
  {
    prompt: "Standard deviation of 10,20,30,40,50",
    hissab_expressions: ["standard deviation(10,20,30,40,50)"],
  },
  {
    prompt: "Median of 12,45,78,23,56",
    hissab_expressions: ["median(12,45,78,23,56)"],
  },
  {
    prompt: "What date is 3 weeks after July 4 2023?",
    hissab_expressions: ["July 4 2023 + 3 weeks"],
  },
  {
    prompt: "How many days between Jan 1 2023 and Mar 15 2023?",
    hissab_expressions: ["Jan 1 2023 - Mar 15 2023 to days"],
  },
  {
    prompt: "Convert 3:30 PM PST to Beijing time",
    hissab_expressions: ["3:30 PM PST in Beijing"],
  },
  {
    prompt: "What is today's date plus 10 days?",
    hissab_expressions: ["today + 10 days"],
  },
  {
    prompt: "Unix timestamp for noon on Dec 25 2023",
    hissab_expressions: ["Dec 25 2023 12:00 PM to timestamp"],
  },
  {
    prompt: "Convert binary 101010 to decimal",
    hissab_expressions: ["0b101010 to decimal"],
  },
  {
    prompt: "Add hexadecimal FF and binary 1010",
    hissab_expressions: ["0xFF + 0b1010"],
  },
  {
    prompt: "Convert decimal 255 to hexadecimal",
    hissab_expressions: ["255 to hexadecimal"],
  },
  {
    prompt: "Bitwise AND of 15 and 7",
    hissab_expressions: ["15 & 7"],
  },
  {
    prompt: "Left shift 25 by 3 bits",
    hissab_expressions: ["25 << 3"],
  },
  {
    prompt: "Bitwise NOT of binary 1010",
    hissab_expressions: ["~0b1010"],
  },
  {
    prompt: "Convert #FF00FF to RGB",
    hissab_expressions: ["#FF00FF to rgb color"],
  },
  {
    prompt: "Mix red and blue colors",
    hissab_expressions: ["red + blue"],
  },
  {
    prompt: "Darker version of #AABBCC by 0.5",
    hissab_expressions: ["#AABBCC + 0.5"],
  },
  {
    prompt: "Complementary color of green",
    hissab_expressions: ["~green"],
  },
  {
    prompt: "Calculate (15% of 200) plus (3^4) minus the average of 10,20,30",
    hissab_expressions: ["(15% of 200) + (3^4) - avg(10,20,30)"],
  },
  {
    prompt: "Convert 5 feet 3 inches to centimeters",
    hissab_expressions: ["5 feet 3 inches to centimeters"],
  },
  {
    prompt: "If I was born on June 15 1985, how many days have I lived?",
    hissab_expressions: ["today - June 15 1985 to days"],
  },
  {
    prompt: "What is the hexadecimal result of (255 AND 0b11001100) plus 25?",
    hissab_expressions: ["(255 & 0b11001100) + 25 to hexadecimal"],
  },
  {
    prompt: "Calculate the hypotenuse of a right triangle with sides 3 and 4",
    hissab_expressions: ["(3^2 + 4^2)^(1/2)"],
  },
  {
    prompt: "Convert 1 million seconds to days, hours, minutes",
    hissab_expressions: ["1 million seconds to days, hours, minutes"],
  },
  {
    prompt: "What is 15% of the average of 100, 200, and 300?",
    hissab_expressions: ["15% of avg(100, 200, 300)"],
  },
  {
    prompt: "How many cubic inches is a 5 gallon bucket?",
    hissab_expressions: ["5 gallon to cubic inches"],
  },
  {
    prompt:
      "Calculate the time difference between 3:30 PM PST and 5:45 AM GMT tomorrow",
    hissab_expressions: ["5:45 AM GMT - 3:30 PM PST to hours"],
  },
  {
    prompt: "What is the factorial of the number of combinations of 5 from 10?",
    hissab_expressions: [
      "num_combinations = 10 comb 5",
      "result = num_combinations!",
    ],
  },
  {
    prompt: "Convert the result of (2^10) to binary and then to hexadecimal",
    hissab_expressions: [
      "value = (2^10)",
      "value_to_binary = value to binary",
      "value_to_hex = value to hexadecimal",
    ],
  },
  {
    prompt: "Calculate the percentage difference between 150 and 200",
    hissab_expressions: ["((200-150)/150) * 100"],
  },
  {
    prompt: "What is the date 3 quarters from today?",
    hissab_expressions: ["today + 3 * 3 months"],
  },
  {
    prompt: "Convert 1 astronomical unit to kilometers and miles",
    hissab_expressions: ["1 astronomical unit to kilometers, miles"],
  },
  {
    prompt: "Calculate the harmonic mean of prime numbers under 10",
    hissab_expressions: ["harmonic mean(2,3,5,7)"],
  },
  {
    prompt: "What is 5 squared plus 3 cubed?",
    hissab_expressions: ["5^2 + 3^3"],
  },
  {
    prompt: "Calculate 14 + 88 divided by 11 multiplied by 23.56 minus 17",
    hissab_expressions: ["14 + 88/11 * 23.56 - 17"],
  },
  {
    prompt: "What's the result of 256 to the power of one-eighth?",
    hissab_expressions: ["256^(1/8)"],
  },
  {
    prompt: "Find the factorial of 5",
    hissab_expressions: ["5!"],
  },
  {
    prompt: "Compute 10 modulo 7",
    hissab_expressions: ["10 mod 7"],
  },
  {
    prompt: "What is the absolute value of negative 234?",
    hissab_expressions: ["abs(-234)"],
  },
  {
    prompt: "What is 25 percent of 200?",
    hissab_expressions: ["25% of 200"],
  },
  {
    prompt: "Apply a 30 percent discount to 2478",
    hissab_expressions: ["2478 - 30%"],
  },
  {
    prompt: "Add 78 percent to 873",
    hissab_expressions: ["78% + 873"],
  },
  {
    prompt: "What number, when 33 percent is taken, equals 3000?",
    hissab_expressions: ["33% of what is 3000"],
  },
  {
    prompt: "Convert 15 kilometers to miles",
    hissab_expressions: ["15 kilometers to miles"],
  },
  {
    prompt: "Break down 9234 miles into yards, feet, and inches",
    hissab_expressions: ["9234 miles to yards, feet, inches"],
  },
  {
    prompt: "Add 13 kilograms and 12 pounds",
    hissab_expressions: ["13 kilograms + 12 pounds"],
  },
  {
    prompt: "Convert 100 Celsius to Fahrenheit",
    hissab_expressions: ["100 Celsius to Fahrenheit"],
  },
  {
    prompt: "How many cubic meters are in 50 gallons?",
    hissab_expressions: ["50 gallons to cubic meters"],
  },
  {
    prompt:
      "What's the maximum value among 10 million, 30k, 7.7 million, and 123123121234?",
    hissab_expressions: ["max(10 million, 30k, 7.7 million, 123123121234)"],
  },
  {
    prompt: "Find the minimum of those same numbers",
    hissab_expressions: ["min(10 million, 30k, 7.7 million, 123123121234)"],
  },
  {
    prompt: "Calculate the least common multiple of 12, 15, 18, and 25",
    hissab_expressions: ["lcm(12,15,18,25)"],
  },
  {
    prompt: "Determine the greatest common divisor of 12, 15, 18, and 25",
    hissab_expressions: ["gcd(12,15,18,25)"],
  },
  {
    prompt: "How many ways can I pick 3 people from a group of 10?",
    hissab_expressions: ["10 comb 3"],
  },
  {
    prompt:
      "How many ways can I select a captain, pitcher, and shortstop from 10 people?",
    hissab_expressions: ["10 perm 3"],
  },
  {
    prompt: "Calculate the natural log of 20",
    hissab_expressions: ["log 20"],
  },
  {
    prompt: "Find log base 10 of 20",
    hissab_expressions: ["log10 20"],
  },
  {
    prompt: "Compute log base 2 of 20",
    hissab_expressions: ["log2 20"],
  },
  {
    prompt: "What is the average of 99, 34, 65, 213, 45, and 123?",
    hissab_expressions: ["avg(99,34,65,213,45,123)"],
  },
  {
    prompt: "Calculate the harmonic mean of those numbers",
    hissab_expressions: ["harmonic mean(99,34,65,213,45,123)"],
  },
  {
    prompt: "Find the geometric mean of those numbers",
    hissab_expressions: ["geometric mean(99,34,65,213,45,123)"],
  },
  {
    prompt: "Compute the standard deviation",
    hissab_expressions: ["standard deviation(99,34,65,213,45,123)"],
  },
  {
    prompt: "Calculate the variance",
    hissab_expressions: ["variance(99,34,65,213,45,123)"],
  },
  {
    prompt: "Determine the median of those numbers",
    hissab_expressions: ["median(99,34,65,213,45,123)"],
  },
  {
    prompt: "What is the range of those numbers?",
    hissab_expressions: ["range(99,34,65,213,45,123)"],
  },
  {
    prompt: "What is the sine of 45 degrees?",
    hissab_expressions: ["sin 45 degrees"],
  },
  {
    prompt: "Calculate cosine of 60 degrees",
    hissab_expressions: ["cos 60 degrees"],
  },
  {
    prompt: "Find tangent of 30 degrees",
    hissab_expressions: ["tan 30 degrees"],
  },
  {
    prompt: "Compute secant of 0.785 radians",
    hissab_expressions: ["sec 0.785 radians"],
  },
  {
    prompt: "What date is 5 days after August 7th, 2020?",
    hissab_expressions: ["August 7 2020 + 5 days"],
  },
  {
    prompt: "What date is 5 days before August 7th, 2020?",
    hissab_expressions: ["August 7 2020 - 5 days"],
  },
  {
    prompt:
      "How many minutes are between August 7th, 2020, and September 9th, 2020?",
    hissab_expressions: ["August 7 2020 - September 9 2020 to minutes"],
  },
  {
    prompt: "If I was born on February 1st, 1990, how old am I today?",
    hissab_expressions: ["today - February 1 1990 to years"],
  },
  {
    prompt: "Find the Unix time for March 6th, 2022, at 7:23:30 PM",
    hissab_expressions: ["March 6 2022 7:23:30 PM to unix"],
  },
  {
    prompt: "Convert binary 10011010 to decimal",
    hissab_expressions: ["0b10011010 to decimal"],
  },
  {
    prompt:
      "Add binary 10011010, hexadecimal 12ab2e4, and subtract octal 12341",
    hissab_expressions: ["0b10011010 + 0x12ab2e4 - 0o12341"],
  },
  {
    prompt: "What is the binary representation of this addition?",
    hissab_expressions: ["(0b10011010 + 0x12ab2e4 - 0o12341) to binary"],
  },
  {
    prompt: "Perform a bitwise NOT on binary 011010",
    hissab_expressions: ["~0b011010"],
  },
  {
    prompt: "Do a bitwise AND between 123123 and binary 100101",
    hissab_expressions: ["123123 & 0b100101"],
  },
  {
    prompt:
      "Perform a bitwise OR between binary 1011010 and hexadecimal 123abe23",
    hissab_expressions: ["0b1011010 | 0x123abe23"],
  },
  {
    prompt: "Do a bitwise XOR between octal 1024123 and binary 0101101001",
    hissab_expressions: ["0o1024123 xor 0b0101101001"],
  },
  {
    prompt: "Right shift 12342 by 5 positions",
    hissab_expressions: ["12342 >> 5"],
  },
  {
    prompt: "Left shift 72318379 by 3 positions",
    hissab_expressions: ["72318379 << 3"],
  },
  {
    prompt: "Convert hex color #ffa2b3 to RGB",
    hissab_expressions: ["#ffa2b3 to rgb color"],
  },
  {
    prompt: "Mix the colors red (#ff0000) and blue (#0000ff)",
    hissab_expressions: ["#ff0000 + #0000ff"],
  },
  {
    prompt: "Find the color temperature of #8100ff",
    hissab_expressions: ["#8100ff to color temperature"],
  },
  {
    prompt: "Make #ffa2b3 one shade darker",
    hissab_expressions: ["#ffa2b3 + 1"],
  },
  {
    prompt: "Make #ffa2b3 one shade lighter",
    hissab_expressions: ["#ffa2b3 - 1"],
  },
  {
    prompt: "Get the complimentary color of red",
    hissab_expressions: ["~red"],
  },
  {
    prompt: "Convert 78 kilometers to miles and compare with 45 miles",
    hissab_expressions: ["78 kilometers to miles", "prev - 45 miles"],
  },
  {
    prompt:
      "Calculate the average of your age in different units: years, months, weeks, and days",
    hissab_expressions: [],
  },
  {
    prompt:
      "Find the color that's the combination of your birthday date and your favorite number's hex representation",
    hissab_expressions: [],
  },
  {
    prompt: "add 15.5, 23, and 7.8",
    hissab_expressions: ["15.5+23+7.8"],
  },
  {
    prompt: "subtract 99 from 1024",
    hissab_expressions: ["1024-99"],
  },
  {
    prompt: "multiply 18 by 3.14",
    hissab_expressions: ["18*3.14"],
  },
  {
    prompt: "divide 2048 by 128",
    hissab_expressions: ["2048/128"],
  },
  {
    prompt: "calculate 7 to the power of 4",
    hissab_expressions: ["7^4"],
  },
  {
    prompt: "what is the square root of 169?",
    hissab_expressions: ["169^(1/2)"],
  },
  {
    prompt: "compute the factorial of 7",
    hissab_expressions: ["7!"],
  },
  {
    prompt: "what is the remainder when 123 is divided by 11?",
    hissab_expressions: ["123 mod 11"],
  },
  {
    prompt: "absolute difference between 50 and -150",
    hissab_expressions: ["abs(50 - (-150))"],
  },
  {
    prompt: "compute (10 + 5) * 3 - 2^3 / 4",
    hissab_expressions: ["(10+5)*3 - 2^3/4"],
  },
  {
    prompt: "find 35% of 1500",
    hissab_expressions: ["35% of 1500"],
  },
  {
    prompt: "what is the price of a $99 item after a 15% discount?",
    hissab_expressions: ["$99 - 15%"],
  },
  {
    prompt: "increase 500 by 12%",
    hissab_expressions: ["12% + 500"],
  },
  {
    prompt: "75 is 20% of what number?",
    hissab_expressions: ["20% of what is 75"],
  },
  {
    prompt: "calculate a 20% tip on a $85.50 bill",
    hissab_expressions: ["20% of $85.50"],
  },
  {
    prompt: "convert 25 kilometers to miles",
    hissab_expressions: ["25 kilometers to miles"],
  },
  {
    prompt: "how many feet are in 300 meters?",
    hissab_expressions: ["300 meters to feet"],
  },
  {
    prompt: "express 10 kilometers in yards, feet, and inches",
    hissab_expressions: ["10 kilometers to yards, feet, inches"],
  },
  {
    prompt: "add 5 feet 8 inches and 1.5 meters",
    hissab_expressions: ["(5 feet + 8 inches) + 1.5 meters"],
  },
  {
    prompt: "subtract 500 grams from 2 kilograms",
    hissab_expressions: ["2 kilograms - 500 grams"],
  },
  {
    prompt: "convert 70 Fahrenheit to Celsius",
    hissab_expressions: ["70 Fahrenheit to Celsius"],
  },
  {
    prompt: "how many gallons is 20 litres?",
    hissab_expressions: ["20 litres to gallons"],
  },
  {
    prompt: "convert 2 square miles to acres",
    hissab_expressions: ["2 square miles to acres"],
  },
  {
    prompt: "what is 10 megabytes in kilobytes?",
    hissab_expressions: ["10 megabytes to kilobytes"],
  },
  {
    prompt: "convert 3 hours and 15 minutes to seconds",
    hissab_expressions: ["3 hours 15 minutes to seconds"],
  },
  {
    prompt: "2 light years to astronomical units",
    hissab_expressions: ["2 light years to astronomical units"],
  },
  {
    prompt:
      "Convert 100 knots to km/h (requires Hissab to understand knots as nautical miles per hour)",
    hissab_expressions: [],
  },
  {
    prompt: "find the maximum of 1.2 million, 500k, and 9 hundred thousand",
    hissab_expressions: ["max(1.2 million, 500k, 9 hundred thousand)"],
  },
  {
    prompt: "what is the smallest value among 0.01, 0.005, 0.015?",
    hissab_expressions: ["min(0.01, 0.005, 0.015)"],
  },
  {
    prompt: "find the least common multiple of 12, 15, and 20",
    hissab_expressions: ["lcm(12, 15, 20)"],
  },
  {
    prompt: "find the greatest common divisor of 48, 72, and 120",
    hissab_expressions: ["gcd(48, 72, 120)"],
  },
  {
    prompt: "how many ways to arrange 4 books out of 9 on a shelf?",
    hissab_expressions: ["9 perm 4"],
  },
  {
    prompt: "how many ways to choose a committee of 3 people from 8?",
    hissab_expressions: ["8 comb 3"],
  },
  {
    prompt: "natural logarithm of 50",
    hissab_expressions: ["log 50"],
  },
  {
    prompt: "calculate log base 10 of 10000",
    hissab_expressions: ["log10 10000"],
  },
  {
    prompt: "what is log base 2 of 1024?",
    hissab_expressions: ["log2 1024"],
  },
  {
    prompt: "find the average of 10, 15, 20, 25, 30",
    hissab_expressions: ["avg(10, 15, 20, 25, 30)"],
  },
  {
    prompt: "calculate the harmonic mean of 1, 2, and 4",
    hissab_expressions: ["harmonic mean(1, 2, 4)"],
  },
  {
    prompt: "geometric mean of 2, 8, 32",
    hissab_expressions: ["geometric mean(2, 8, 32)"],
  },
  {
    prompt: "find the standard deviation of the numbers 2, 4, 4, 4, 5, 5, 7, 9",
    hissab_expressions: ["standard deviation(2, 4, 4, 4, 5, 5, 7, 9)"],
  },
  {
    prompt: "compute the variance for 100, 150, 120, 130",
    hissab_expressions: ["variance(100, 150, 120, 130)"],
  },
  {
    prompt: "what is the median of 3, 1, 4, 1, 5, 9, 2, 6?",
    hissab_expressions: ["median(3, 1, 4, 1, 5, 9, 2, 6)"],
  },
  {
    prompt: "find the range of values: 10, 5, 25, 15, 30",
    hissab_expressions: ["range(10, 5, 25, 15, 30)"],
  },
  {
    prompt: "calculate the sine of 90 degrees",
    hissab_expressions: ["sin 90 degrees"],
  },
  {
    prompt: "what is the cosine of pi/3 radians?",
    hissab_expressions: ["cos (pi/3) radians"],
  },
  {
    prompt: "find the tangent of 45 deg",
    hissab_expressions: ["tan 45 degrees"],
  },
  {
    prompt: "calculate the inverse cosine of 0.5 in degrees",
    hissab_expressions: ["acos 0.5 to degrees"],
  },
  {
    prompt: "compute the hyperbolic sine of 1",
    hissab_expressions: ["sinh 1"],
  },
  {
    prompt: "secant of 60 degrees",
    hissab_expressions: ["sec 60 degrees"],
  },
  {
    prompt: "what date is 15 days after 2023.11.10?",
    hissab_expressions: ["2023.11.10 + 15 days"],
  },
  {
    prompt: "what date was 6 months before today?",
    hissab_expressions: ["today - 6 months"],
  },
  {
    prompt: "how many weeks are between March 1, 2024 and August 15, 2024?",
    hissab_expressions: ["March 1, 2024 - August 15, 2024 to weeks"],
  },
  {
    prompt:
      "calculate my exact age in years, months, and days if I was born on 12 Jan 1988",
    hissab_expressions: ["today - 12 Jan 1988 to years, months, days"],
  },
  {
    prompt: "find the unix epoch time for New Year's Day 2025 midnight UTC",
    hissab_expressions: ["New Year's Day 2025 00:00:00 UTC to epoch"],
  },
  {
    prompt: "convert timestamp 1678886400 to human readable date and time",
    hissab_expressions: ["1678886400 to human date"],
  },
  {
    prompt: "what is the current time in New Delhi?",
    hissab_expressions: ["now in New Delhi"],
  },
  {
    prompt: "If it's 3 PM in London, what time is it in Los Angeles (PST)?",
    hissab_expressions: ["3 PM London in PST"],
  },
  {
    prompt:
      "What day of the week will Christmas be in 2025? (Might require post-processing or specific Hissab function not listed, but implies date calculation)",
    hissab_expressions: ["Christmas 2025"],
  },
  {
    prompt: "convert binary 1110101 to decimal",
    hissab_expressions: ["0b1110101 to decimal"],
  },
  {
    prompt: "show 100 in hexadecimal",
    hissab_expressions: ["100 to hexadecimal"],
  },
  {
    prompt: "convert octal 177 to binary",
    hissab_expressions: ["0o177 to binary"],
  },
  {
    prompt: "calculate 0xAF + 0b1001 - 0o77 and show the result in octal",
    hissab_expressions: ["(0xAF + 0b1001 - 0o77) to octal"],
  },
  {
    prompt: "bitwise NOT of 12 in binary representation (assuming 8-bit)",
    hissab_expressions: ["~12 to binary"],
  },
  {
    prompt: "compute 255 AND 170",
    hissab_expressions: ["255 & 170"],
  },
  {
    prompt: "0b101010 OR 0b010101",
    hissab_expressions: ["0b101010 | 0b010101"],
  },
  {
    prompt: "55 XOR 22",
    hissab_expressions: ["55 xor 22"],
  },
  {
    prompt: "right shift the number 240 by 4 bits",
    hissab_expressions: ["240 >> 4"],
  },
  {
    prompt: "left shift 15 by 3 bits",
    hissab_expressions: ["15 << 3"],
  },
  {
    prompt: "convert hex color #aabbcc to rgb",
    hissab_expressions: ["#aabbcc to rgb color"],
  },
  {
    prompt: "what is the hex code for the color magenta?",
    hissab_expressions: ["magenta to hex color"],
  },
  {
    prompt: "mix the colors #FF0000 and #00FF00",
    hissab_expressions: ["#FF0000 + #00FF00"],
  },
  {
    prompt: "find the color temperature of white",
    hissab_expressions: ["white to color temperature"],
  },
  {
    prompt: "make the color navy 30% lighter",
    hissab_expressions: ["navy - 0.3"],
  },
  {
    prompt: "give me a 50% darker version of #00FF00",
    hissab_expressions: ["#00FF00 + 1.5"],
  },
  {
    prompt: "what is the complementary color of cyan?",
    hissab_expressions: ["~cyan"],
  },
  {
    prompt:
      "Convert 50 miles per hour to kilometers per hour. Then tell me how many meters per second that is.",
    hissab_expressions: [],
  },
  {
    prompt:
      "Calculate the area of a circle with radius 5 meters. Then convert that area to square feet. (Area = pi*r^2)",
    hissab_expressions: [
      "area_val = pi * 5^2",
      "area_sq_meters = area_val square meters",
      "area_sq_ft = area_sq_meters to square feet",
    ],
  },
  {
    prompt: "What is 10 factorial? Then find the natural log of the result.",
    hissab_expressions: [
      "factorial_val = 10!",
      "log_result = log factorial_val",
    ],
  },
  {
    prompt: "Find the date 100 days from today. What day of the week is that?",
    hissab_expressions: ["date_100_days_later = today + 100 days"],
  },
  {
    prompt: "Calculate 25% of 800. Then subtract that amount from 1000.",
    hissab_expressions: ["amount = 25% of 800", "result = 1000 - amount"],
  },
  {
    prompt:
      "I earn $4500 per month, spend $1200 on rent, $600 on food, and $200 on utilities. How much do I save per year?",
    hissab_expressions: [
      "monthly_savings = $4500 - $1200 - $600 - $200",
      "yearly_savings = monthly_savings monthly to yearly",
    ],
  },
  {
    prompt:
      "I invest $5000 today with an annual return of 7%. What will it be worth in 20 years?",
    hissab_expressions: ["$5000 * (1 + 0.07)^20"],
  },
  {
    prompt:
      "My loan balance is $250,000 at 5% annual interest. If I pay $1500 per month, how long will it take to pay off?",
    hissab_expressions: [],
  },
  {
    prompt:
      "I save $300 per month and earn 5% annual interest, compounded monthly. How much will I have in 15 years?",
    hissab_expressions: ["$300 * (((1 + (0.05/12))^(15*12) - 1) / (0.05/12))"],
  },
  {
    prompt:
      "I bought an item for $2499 and got a 15% discount. How much did I pay?",
    hissab_expressions: ["$2499 - 15%"],
  },
  {
    prompt:
      "My salary increases by 4% per year. If I start with $60,000, what will it be in 5 years?",
    hissab_expressions: ["$60000 * (1 + 0.04)^5"],
  },
  {
    prompt:
      "If a store is offering 25% off on an item originally priced at $120, and I have a $10 coupon, how much do I pay?",
    hissab_expressions: ["($120 - 25%) - $10"],
  },
  {
    prompt: "If I start a 2-hour movie at 7:30 PM, what time will it end?",
    hissab_expressions: ["7:30 PM + 2 hours"],
  },
  {
    prompt: "I was born on 15th June 1995. How old am I today?",
    hissab_expressions: ["today - 15 June 1995 to years"],
  },
  {
    prompt:
      "If my flight lands in New York at 8:00 AM PST, what time is that in GMT?",
    hissab_expressions: ["8:00 AM PST in GMT"],
  },
  {
    prompt: "How many days are left until Christmas?",
    hissab_expressions: ["Christmas - today to days"],
  },
  {
    prompt: "I ran 5 kilometers today. How many miles is that?",
    hissab_expressions: ["5 kilometers to miles"],
  },
  {
    prompt: "I need 2 gallons of water. How many liters is that?",
    hissab_expressions: ["2 gallons to liters"],
  },
  {
    prompt: "If I weigh 70 kilograms, how many pounds is that?",
    hissab_expressions: ["70 kilograms to pounds"],
  },
  {
    prompt: "Convert 78°F to Celsius.",
    hissab_expressions: ["78 Fahrenheit to Celsius"],
  },
  {
    prompt: "How many seconds are in 2 weeks?",
    hissab_expressions: ["2 weeks to seconds"],
  },
  {
    prompt:
      "If I consume 2500 calories per day and burn 2800 calories, how much weight will I lose in a month? (Assume 7700 calories = 1 kg)",
    hissab_expressions: [
      "daily_calorie_deficit = 2800 - 2500",
      "monthly_calorie_deficit = daily_calorie_deficit * (1 month to days)",
      "weight_loss_kg = monthly_calorie_deficit / 7700",
    ],
  },
  {
    prompt:
      "I drink 8 glasses of water daily, each glass is 250ml. How much water do I consume in a year?",
    hissab_expressions: [
      "daily_water_ml = 8 * 250 ml",
      "yearly_water_liters = daily_water_ml daily to yearly",
    ],
  },
  {
    prompt:
      "How much is the gravitational force between two 5kg masses separated by 2 meters? (Use G = 6.674×10⁻¹¹)",
    hissab_expressions: ["(6.674e-11 * 5 * 5) / (2^2)"],
  },
  {
    prompt:
      "If a car accelerates at 3 m/s² for 10 seconds, how fast will it be going?",
    hissab_expressions: ["3 * 10"],
  },
  {
    prompt: "What is the speed of light in miles per second?",
    hissab_expressions: [],
  },
  {
    prompt: "Find the largest of these values: 23, 45, 67, 89, 101, 34.",
    hissab_expressions: ["max(23, 45, 67, 89, 101, 34)"],
  },
  {
    prompt: "What is the average of 87, 93, 102, 115, and 120?",
    hissab_expressions: ["avg(87, 93, 102, 115, 120)"],
  },
  {
    prompt: "Find the standard deviation of 12, 14, 19, 22, 25.",
    hissab_expressions: ["standard deviation(12, 14, 19, 22, 25)"],
  },
  {
    prompt: "What is the binary representation of 873?",
    hissab_expressions: ["873 to binary"],
  },
  {
    prompt: "Perform bitwise AND on 0b1101 and 0b1011.",
    hissab_expressions: ["0b1101 & 0b1011"],
  },
  {
    prompt: "Convert the color #ffa500 to RGB.",
    hissab_expressions: ["#ffa500 to rgb color"],
  },
  {
    prompt: "What is the complementary color of blue?",
    hissab_expressions: ["~blue"],
  },
  {
    prompt:
      "If I start a business with $10,000 and earn 20% profit every year, how much will I have in 5 years?",
    hissab_expressions: ["$10000 * (1 + 0.20)^5"],
  },
  {
    prompt:
      "A rectangle has a length of 12 meters and width of 8 meters. What is its area in square feet?",
    hissab_expressions: [
      "area_sq_m = 12 * 8",
      "area_sq_ft = area_sq_m square meters to square feet",
    ],
  },
  {
    prompt:
      "If a car travels 60 miles per hour, how long will it take to cover 150 miles?",
    hissab_expressions: ["150 / 60"],
  },
  {
    prompt:
      "I work 40 hours per week and earn $25 per hour. What is my monthly salary before taxes?",
    hissab_expressions: ["(40 * $25) weekly to monthly"],
  },
  {
    prompt:
      "I start a savings account with $5000 and add $200 every month. How much will I have in 3 years?",
    hissab_expressions: [],
  },
  {
    prompt:
      "My trip distance is 400 miles, and my car gives 30 miles per gallon. Gas costs $3.50 per gallon. What is my fuel cost?",
    hissab_expressions: [
      "gallons_needed = 400 / 30",
      "fuel_cost = gallons_needed * $3.50",
    ],
  },
  {
    prompt:
      "If my daily commute is 22 miles, how many hours do I spend commuting in a year? (Assume 250 workdays)",
    hissab_expressions: [],
  },
  {
    prompt:
      "My monthly income is $6,200. I spend $1,800 on rent, $400 on utilities, $600 on food, and $350 on transportation. I also have a student loan payment of $200 per month. If I save 15% of my remaining income, how much will I have saved in 5 years?",
    hissab_expressions: [
      "total_expenses = $1800 + $400 + $600 + $350 + $200",
      "remaining_income = $6200 - total_expenses",
      "monthly_savings = 15% of remaining_income",
      "yearly_savings = monthly_savings monthly to yearly",
      "savings_in_5_years = yearly_savings * 5",
    ],
  },
  {
    prompt:
      "I want to invest $10,000 in a stock that has an average annual return of 8%. How much will my investment be worth in 20 years, assuming compound interest?",
    hissab_expressions: ["$10000 * (1 + 0.08)^20"],
  },
  {
    prompt:
      "I'm buying a house for $350,000 with a 20% down payment. I'm getting a 30-year mortgage at a 4.5% interest rate. What will my monthly mortgage payment be?",
    hissab_expressions: [],
  },
  {
    prompt:
      "I have a credit card with a balance of $2,500 and an APR of 18%. If I only make the minimum payment of $50 per month, how long will it take to pay off the balance?",
    hissab_expressions: [],
  },
  {
    prompt:
      "Calculate my net worth if I have $50,000 in savings, $20,000 in stocks, a car worth $15,000, and a student loan of $10,000 and credit card debt of 5000.",
    hissab_expressions: ["$50000 + $20000 + $15000 - $10000 - $5000"],
  },
  {
    prompt:
      "If I drive at an average speed of 65 miles per hour, how long will it take me to travel 350 kilometers?",
    hissab_expressions: [
      "distance_miles = 350 kilometers to miles",
      "time_hours = distance_miles / 65",
    ],
  },
  {
    prompt:
      "I'm planning a trip from London to Tokyo. If the flight time is 12 hours and 30 minutes, and I leave London at 10:00 AM GMT, what time will I arrive in Tokyo local time?",
    hissab_expressions: ["(10:00 AM GMT + 12 hours 30 minutes) in Tokyo"],
  },
  {
    prompt:
      "If a plane is flying at 500 knots, how many miles will it travel in 3 hours?",
    hissab_expressions: [],
  },
  {
    prompt:
      "A recipe calls for 2 cups of flour, but I only want to make half the recipe. How much flour do I need in tablespoons?",
    hissab_expressions: ["(2 cups * 0.5) to tablespoons"],
  },
  {
    prompt:
      "Convert a baking temperature of 350 degrees Fahrenheit to Celsius.",
    hissab_expressions: ["350 Fahrenheit to Celsius"],
  },
  {
    prompt: "Calculate the area of a circle with a diameter of 10 centimeters.",
    hissab_expressions: [
      "radius_cm = 10/2",
      "area_sq_cm = pi * radius_cm^2",
      "result = area_sq_cm square centimeters",
    ],
  },
  {
    prompt:
      "If an object is falling from a height of 100 meters, how long will it take to reach the ground, ignoring air resistance?",
    hissab_expressions: ["(2 * 100 / 9.81)^(1/2)"],
  },
  {
    prompt:
      "What is the hypotenuse of a right-angled triangle with sides of 3 inches and 4 inches?",
    hissab_expressions: ["((3 inches)^2 + (4 inches)^2)^(1/2)"],
  },
  {
    prompt:
      "I want to mix a red (#FF0000) paint with a blue (#0000FF) paint. What is the resulting color in RGB?",
    hissab_expressions: ["(#FF0000 + #0000FF) to rgb color"],
  },
  {
    prompt: "What is the complimentary color to rgb(100, 150, 200)?",
    hissab_expressions: ["~rgb(100, 150, 200)"],
  },
  {
    prompt:
      "I have a dataset of test scores: 78, 85, 92, 68, 75, 89. What is the average and standard deviation of these scores?",
    hissab_expressions: [
      "average_score = avg(78, 85, 92, 68, 75, 89)",
      "std_dev_score = standard deviation(78, 85, 92, 68, 75, 89)",
    ],
  },
  {
    prompt: "If I have 10 gigabytes of data, how many megabytes is that?",
    hissab_expressions: ["10 gigabytes to megabytes"],
  },
  {
    prompt:
      "My salary is 5,500/month.I pay 2,100 in rent, 300 in car payments, 550 for groceries, and earn an extra $800/month. How much can I save in 10 years?",
    hissab_expressions: [
      "monthly_income = 5500 + 800",
      "monthly_expenses = 2100 + 300 + 550",
      "monthly_savings = monthly_income - monthly_expenses",
      "yearly_savings = monthly_savings monthly to yearly",
      "ten_year_savings = yearly_savings * 10",
    ],
  },
  {
    prompt:
      "If I invest $300 monthly at 7% annual return, compounded monthly, how much will I have after 20 years?",
    hissab_expressions: ["$300 * (((1 + (0.07/12))^(20*12) - 1) / (0.07/12))"],
  },
  {
    prompt:
      "I bought a house for $350,000 with a 20% down payment and a 30-year mortgage at 4.5% APR. What’s my monthly payment?",
    hissab_expressions: [],
  },
  {
    prompt:
      "If I spend 120 on groceries, 80 on dining, 60 on gas, and 200 on entertainment per week, how much do I spend yearly?",
    hissab_expressions: [
      "weekly_spending = 120 + 80 + 60 + 200",
      "yearly_spending = weekly_spending weekly to yearly",
    ],
  },
  {
    prompt: "15,000 loan at 6400 monthly, how long until it’s paid off?",
    hissab_expressions: [],
  },
  {
    prompt:
      "If a stock grows from 120 to 185 in 3 years, what’s the annualized return?",
    hissab_expressions: ["((185/120)^(1/3) - 1) * 100"],
  },
  {
    prompt:
      "A startup’s revenue grows from 50k to 200k in 4 years. What’s the CAGR?",
    hissab_expressions: ["((200000/50000)^(1/4) - 1) * 100"],
  },
  {
    prompt:
      "If a company’s profit margin is 15% and revenue is $1.2M, what’s the net profit?",
    hissab_expressions: ["15% of $1.2M"],
  },
  {
    prompt:
      "If I sell a product for $45 with a 30% margin, what’s my cost price?",
    hissab_expressions: ["$45 * (1 - 0.30)"],
  },
  {
    prompt:
      "If I get a 5% raise every year from a $60,000 salary, what will my salary be in 7 years?",
    hissab_expressions: ["$60000 * (1 + 0.05)^7"],
  },
  {
    prompt:
      "If I burn 500 calories per workout and do 4 workouts a week, how many pounds will I lose in 3 months (assuming 3,500 calories = 1 lb)?",
    hissab_expressions: [
      "weekly_calories_burned = 500 * 4",
      "calories_burned_3_months = weekly_calories_burned * (3 months to weeks)",
      "pounds_lost = calories_burned_3_months / 3500",
    ],
  },
  {
    prompt:
      "If I walk 8,000 steps daily, how many miles is that in a year (2,000 steps ≈ 1 mile)?",
    hissab_expressions: [
      "daily_miles = 8000 / 2000",
      "yearly_miles = daily_miles * (1 year to days)",
    ],
  },
  {
    prompt:
      "If I drink 2.5 liters of water daily, how many gallons is that per year?",
    hissab_expressions: ["(2.5 liters daily to yearly) to gallons"],
  },
  {
    prompt:
      "If my protein intake is 1.6g per kg of body weight and I weigh 75kg, how much protein do I need daily?",
    hissab_expressions: ["1.6 * 75"],
  },
  {
    prompt:
      "If my car gets 28 MPG and gas costs $3.50/gallon, how much does a 450-mile trip cost?",
    hissab_expressions: [
      "gallons_needed = 450 / 28",
      "trip_cost = gallons_needed * $3.50",
    ],
  },
  {
    prompt:
      "If I drive 15,000 miles a year with a 30 MPG car, how much do I spend on gas at $3.80/gallon?",
    hissab_expressions: [
      "gallons_per_year = 15000 / 30",
      "gas_cost_yearly = gallons_per_year * $3.80",
    ],
  },
  {
    prompt:
      "A flight from NYC to London is 7 hours. If I leave at 3:45 PM EST, what’s the arrival time in GMT?",
    hissab_expressions: ["(3:45 PM EST + 7 hours) in GMT"],
  },
  {
    prompt:
      "If a train travels 220 km in 1h 45m, what’s its average speed in mph?",
    hissab_expressions: [],
  },
  {
    prompt:
      "If my electricity bill is $120/month and I install solar panels that save 60%, what’s my new bill?",
    hissab_expressions: ["$120 - 60%"],
  },
  {
    prompt:
      "If my water heater uses 4500 watts and runs 3 hours/day, how much does it cost monthly at $0.12/kWh?",
    hissab_expressions: [
      "daily_kwh = (4500/1000) * 3",
      "monthly_kwh = daily_kwh * (1 month to days)",
      "monthly_cost = monthly_kwh * $0.12",
    ],
  },
  {
    prompt:
      "If a room is 12ft × 15ft with 8ft ceilings, how many gallons of paint are needed (1 gallon covers 350 sq ft)?",
    hissab_expressions: [
      "wall_area1 = 2 * (12 ft * 8 ft)",
      "wall_area2 = 2 * (15 ft * 8 ft)",
      "total_wall_area_sq_ft = wall_area1 + wall_area2",
      "gallons_needed = total_wall_area_sq_ft / (350 square feet)",
    ],
  },
  {
    prompt:
      "If I study 2 hours daily, how many hours is that in a 4-year college degree?",
    hissab_expressions: ["(2 hours daily to yearly) * 4"],
  },
  {
    prompt:
      "If a book has 450 pages and I read 15 pages/day, how many days to finish?",
    hissab_expressions: ["450 / 15"],
  },
  {
    prompt:
      "If I work 8 hours/day, 5 days/week, with 3 weeks vacation, how many hours do I work yearly?",
    hissab_expressions: [
      "work_weeks_per_year = (1 year to weeks) - 3 weeks",
      "work_hours_per_year = (8 * 5) * work_weeks_per_year",
    ],
  },
  {
    prompt:
      "What’s the volume of a cylinder with radius 5cm and height 12cm in cubic inches?",
    hissab_expressions: [
      "volume_cm3_val = pi * (5^2) * 12",
      "volume_cm3 = volume_cm3_val cubic centimeters",
      "volume_in3 = volume_cm3 to cubic inches",
    ],
  },
  {
    prompt:
      "If a car accelerates from 0 to 60 mph in 4.5 seconds, what’s its acceleration in m/s²?",
    hissab_expressions: [],
  },
  {
    prompt:
      "If a circuit has a 12V battery and 3 resistors (4Ω, 6Ω, 8Ω) in series, what’s the current?",
    hissab_expressions: [
      "total_resistance = 4 + 6 + 8",
      "current = 12 / total_resistance",
    ],
  },
  {
    prompt:
      "A $1,200 laptop is on sale for 25% off. If tax is 8%, what’s the final price?",
    hissab_expressions: [
      "discounted_price = $1200 - 25%",
      "final_price = discounted_price + 8%",
    ],
  },
  {
    prompt:
      "If I buy 3 shirts at $25 each with a 'Buy 2, Get 1 Free' deal, what’s the per-shirt cost?",
    hissab_expressions: [
      "total_cost = $25 * 2",
      "per_shirt_cost = total_cost / 3",
    ],
  },
  {
    prompt:
      "A store offers 15% off $500, plus an extra 10% for members. What’s the final price?",
    hissab_expressions: [
      "price_after_first_discount = $500 - 15%",
      "final_price = price_after_first_discount - 10%",
    ],
  },
  {
    prompt:
      "If a recipe serves 6 but I need 18 servings, how much do I multiply ingredients?",
    hissab_expressions: ["18 / 6"],
  },
  {
    prompt:
      "If a marathon is 26.2 miles and I run at 6.5 mph, how long will it take?",
    hissab_expressions: ["26.2 / 6.5"],
  },
  {
    prompt:
      "If a pizza has a 14-inch diameter, what’s its area in square centimeters?",
    hissab_expressions: [
      "radius_inches = 14 / 2",
      "area_sq_inches_val = pi * radius_inches^2",
      "area_sq_inches = area_sq_inches_val square inches",
      "area_sq_cm = area_sq_inches to square centimeters",
    ],
  },
  {
    prompt:
      "If a phone battery lasts 18 hours on 50% brightness, how long at 75% brightness (assuming linear drain)?",
    hissab_expressions: [],
  },
  {
    prompt:
      "If a country’s population grows from 50M to 65M in 10 years, what’s the annual growth rate?",
    hissab_expressions: ["((65M/50M)^(1/10) - 1) * 100"],
  },
  {
    prompt:
      "My salary is 5500 per month, I pay 2100 in rent, 300 in car payments, and 550 for groceries. I also earn extra 800. How much can I save in 10 years?",
    hissab_expressions: [
      "monthly_income = 5500 + 800",
      "monthly_expenses = 2100 + 300 + 550",
      "monthly_savings = monthly_income - monthly_expenses",
      "yearly_savings = monthly_savings monthly to yearly",
      "ten_year_savings = yearly_savings * 10",
    ],
  },
  {
    prompt:
      "I want to buy a house that costs 350,000. If I save 15% of my 6200 monthly income and invest with a 7% annual return, how long will it take to save for a 20% down payment?",
    hissab_expressions: [],
  },
  {
    prompt:
      "Compare my monthly expenses in different currencies: My rent is $2100, converted to euros My car payment of 300 converted to British pounds My grocery bill of 550 converted to Canadian dollars",
    hissab_expressions: [
      "rent_in_eur = $2100 to EUR",
      "car_payment_in_gbp = $300 to GBP",
      "grocery_bill_in_cad = $550 to CAD",
    ],
  },
  {
    prompt:
      "I'm planning a trip from New York to Tokyo. Calculate the total travel time and distance: Distance in miles Flight time Time zone difference",
    hissab_expressions: [],
  },
  {
    prompt:
      "If I travel from San Francisco to Sydney and my flight leaves on 2024.07.15 at 10:00 pm, when will I arrive local time?",
    hissab_expressions: [],
  },
  {
    prompt:
      "Calculate my ideal daily calorie intake based on: Height: 175 cm Weight: 70 kg Age: 35 Activity level: moderately active",
    hissab_expressions: [],
  },
  {
    prompt:
      "Track my weight loss progress: Starting weight: 90 kg Goal weight: 75 kg Current weight: 82 kg Calculate percentage of weight loss and remaining weight to lose",
    hissab_expressions: [
      "weight_lost = 90kg - 82kg",
      "total_to_lose = 90kg - 75kg",
      "percentage_lost = (weight_lost / total_to_lose) * 100",
      "remaining_to_lose = total_to_lose - weight_lost",
    ],
  },
  {
    prompt:
      "Calculate my potential solar panel savings: Current monthly electricity bill: 250 Solar panel system cost: 15000 Annual energy production: 90% of my current usage Electricity rate increase per year: 3%",
    hissab_expressions: [],
  },
  {
    prompt:
      "Compare energy consumption of different appliances: Refrigerator: 1.5 kWh per day Air conditioner: 3.2 kWh per hour TV: 0.1 kWh per hour Calculate monthly and yearly energy cost at $0.12 per kWh",
    hissab_expressions: [
      "fridge_monthly_cost = (1.5 * (1 month to days)) * $0.12",
      "fridge_yearly_cost = (1.5 * (1 year to days)) * $0.12",
      "ac_monthly_cost_per_hour_usage = 3.2 * $0.12",
      "tv_monthly_cost_per_hour_usage = 0.1 * $0.12",
    ],
  },
  {
    prompt:
      "Compare investment growth scenarios: Initial investment: 10000 Monthly contribution: 500 Investment options: a) 5% annual return b) 7% annual return c) 9% annual return Calculate total value after 20 years",
    hissab_expressions: [],
  },
  {
    prompt:
      "Recipe scaling and conversion: Original recipe: 2 cups flour, 250 ml milk, 3 eggs Convert to metric and imperial Scale recipe for 1.5x and 2.5x",
    hissab_expressions: [
      "flour_tbsp = 2 cups to tablespoon",
      "milk_floz = 250 ml to fluid ounce",
      "flour_1_5x_cups = 2 * 1.5 cups",
      "milk_1_5x_ml = 250 * 1.5 ml",
      "eggs_1_5x = 3 * 1.5",
      "flour_2_5x_cups = 2 * 2.5 cups",
      "milk_2_5x_ml = 250 * 2.5 ml",
      "eggs_2_5x = 3 * 2.5",
    ],
  },
  {
    prompt:
      "International Project Cost Comparison: Project budget: 75000 USD Convert to: a) Euros b) Japanese Yen c) British Pounds Calculate potential currency fluctuation impact",
    hissab_expressions: [
      "budget_eur = 75000 USD to EUR",
      "budget_jpy = 75000 USD to JPY",
      "budget_gbp = 75000 USD to GBP",
    ],
  },
  {
    prompt:
      "Carbon Footprint Calculation: Monthly car mileage: 1200 miles Home electricity usage: 750 kWh Meat consumption: 2 kg per week Calculate approximate CO2 emissions",
    hissab_expressions: [],
  },
  {
    prompt:
      "Birthday Numerology meets Financial Planning: Born on: 15.07.1990 Calculate your lucky savings percentage based on birthday digits Apply this to monthly income of 5500",
    hissab_expressions: [],
  },
  {
    prompt:
      "My monthly salary is 5500. I pay 2100 in rent, 300 in car payments, and about 550 for groceries. I also earn an extra 800 most months from a side job. Approximately how much can I save in 5 years, assuming these amounts stay consistent?",
    hissab_expressions: [
      "monthly_income = 5500 + 800",
      "monthly_expenses = 2100 + 300 + 550",
      "monthly_savings = monthly_income - monthly_expenses",
      "yearly_savings = monthly_savings monthly to yearly",
      "five_year_savings = yearly_savings * 5",
    ],
  },
  {
    prompt:
      "I want to buy a laptop that costs $1400. There's a 15% discount, but also an 8% sales tax applied after the discount. What's the final price?",
    hissab_expressions: [
      "price_after_discount = $1400 - 15%",
      "final_price = price_after_discount + 8%",
    ],
  },
  {
    prompt:
      "My current salary is 60,000 per year. If I get a 4% raise next year, and then a 5% raise the year after that, what will my annual salary be in two years?",
    hissab_expressions: [
      "salary_after_1_year = 60000 + 4%",
      "salary_after_2_years = salary_after_1_year + 5%",
    ],
  },
  {
    prompt:
      "I invested $5000. After one year, it grew by 12%. The next year, it unfortunately lost 5% of its current value. How much is my investment worth now?",
    hissab_expressions: [
      "value_after_1_year = $5000 + 12%",
      "value_after_2_years = value_after_1_year - 5%",
    ],
  },
  {
    prompt:
      "I need to save $10,000 for a down payment in 3 years. How much do I need to save per month on average?",
    hissab_expressions: [
      "total_months = 3 years to months",
      "monthly_savings_needed = $10000 / total_months",
    ],
  },
  {
    prompt:
      "I'm planning a trip from London to Tokyo. The flight time is 12 hours and 30 minutes. If I leave London at 10:00 AM GMT, what time will I arrive in Tokyo local time (JST is GMT+9)?",
    hissab_expressions: ["(10:00 AM GMT + 12 hours 30 minutes) in JST"],
  },
  {
    prompt:
      "I'm driving 450 miles. My car averages 25 miles per gallon, and gas costs $3.80 per gallon. How much will the gas for the trip cost?",
    hissab_expressions: [
      "gallons_needed = 450 / 25",
      "trip_cost = gallons_needed * $3.80",
    ],
  },
  {
    prompt:
      "I'm running a 10-kilometer race. My goal is to finish in under 50 minutes. What average speed do I need to maintain in miles per hour?",
    hissab_expressions: [],
  },
  {
    prompt:
      "A train leaves Station A at 8:15 AM and arrives at Station B at 11:45 AM. The distance is 165 kilometers. What was the average speed of the train in km/h?",
    hissab_expressions: [],
  },
  {
    prompt:
      "A recipe calls for 250 grams of flour and serves 4 people. I need to make enough for 10 people. How many kilograms of flour do I need?",
    hissab_expressions: [
      "flour_per_person_g = 250 / 4",
      "total_flour_g = flour_per_person_g * 10",
      "total_flour_kg = total_flour_g grams to kilograms",
    ],
  },
  {
    prompt:
      "I need to paint a wall that is 12 feet high and 25 feet long. One gallon of paint covers 400 square feet. How many gallons do I need? Will a single gallon be enough?",
    hissab_expressions: [
      "wall_area_sq_ft = (12 * 25) square feet",
      "gallons_needed = wall_area_sq_ft / (400 square feet)",
    ],
  },
  {
    prompt:
      "I'm mixing concrete. The ratio is 1 part cement, 2 parts sand, 3 parts gravel. If I use 5 kilograms of cement, how much sand and gravel do I need in total weight (kg)?",
    hissab_expressions: [
      "sand_needed = 5 kilograms * 2",
      "gravel_needed = 5 kilograms * 3",
      "total_sand_gravel = sand_needed + gravel_needed",
    ],
  },
  {
    prompt:
      "Convert a temperature reading of 25 degrees Celsius to Fahrenheit and Kelvin.",
    hissab_expressions: ["25 Celsius to Fahrenheit", "25 Celsius to Kelvin"],
  },
  {
    prompt:
      "A chemical solution has a concentration of 50 grams per liter. How many milligrams of the chemical are in 150 milliliters of the solution?",
    hissab_expressions: [
      "concentration_g_ml = (50 grams) / (1 liter to ml)",
      "chemical_in_grams = concentration_g_ml * (150 ml)",
      "chemical_in_mg = chemical_in_grams to milligrams",
    ],
  },
  {
    prompt:
      "Sound travels at approximately 343 meters per second in air. If I see lightning and hear the thunder 5.5 seconds later, roughly how many miles away was the lightning strike?",
    hissab_expressions: [
      "distance_meters = 343 * 5.5",
      "distance_miles = distance_meters meters to miles",
    ],
  },
  {
    prompt:
      "I bought 5 items costing 12.50, 8.99, 23.00, 5.75, and 19.99. There's a 10% discount on the total. What is the average cost per item after the discount?",
    hissab_expressions: [
      "total_cost_before_discount = 12.50 + 8.99 + 23.00 + 5.75 + 19.99",
      "total_cost_after_discount = total_cost_before_discount - 10%",
      "average_cost_per_item = total_cost_after_discount / 5",
    ],
  },
  {
    prompt:
      "Find the difference in age between someone born on June 15, 1985 and someone born on March 1, 2003. Give the answer in years, months, and days.",
    hissab_expressions: [
      "(March 1, 2003) - (June 15, 1985) to years, months, days",
    ],
  },
  {
    prompt:
      "What's the total storage capacity in Gigabytes of 3 devices: one with 256 GB, one with 0.5 Terabytes, and one with 512000 Megabytes?",
    hissab_expressions: [
      "device1_gb = 256 GB",
      "device2_gb = 0.5 Terabytes to GB",
      "device3_gb = 512000 Megabytes to GB",
      "total_storage_gb = device1_gb + device2_gb + device3_gb",
    ],
  },
  {
    prompt:
      "Calculate 2 raised to the power of 16, then find the square root of the result, and finally express that in hexadecimal.",
    hissab_expressions: [
      "power_val = 2^16",
      "sqrt_val = power_val^(1/2)",
      "hex_val = sqrt_val to hexadecimal",
    ],
  },
  {
    prompt:
      "Find the LCM of 12, 18, and 30. Then calculate the GCD of the same numbers. What is the product of the LCM and GCD?",
    hissab_expressions: [
      "lcm_val = lcm(12, 18, 30)",
      "gcd_val = gcd(12, 18, 30)",
      "product_lcm_gcd = lcm_val * gcd_val",
    ],
  },
  {
    prompt:
      "My monthly income is $6,200. I spend $1,800 on rent, $400 on utilities, $600 on food, and $350 on transportation. I also have a student loan payment of $200 per month. If I save 15% of my remaining income, how much will I have saved in 5 years?",
    hissab_expressions: [
      "total_expenses = $1800 + $400 + $600 + $350 + $200",
      "remaining_income = $6200 - total_expenses",
      "monthly_savings = 15% of remaining_income",
      "yearly_savings = monthly_savings monthly to yearly",
      "savings_in_5_years = yearly_savings * 5",
    ],
  },
  {
    prompt:
      "I have a SaaS where I provide APIs for use to my customers. The product is using AI APIs the cost of 0.10 per 1million tokens My product pricing is $50 per year and it allows fixed number of requests per day. Assuming each requests uses 6000 tokens, how many maximum requests per day can I allow uses to not make a loss ?",
    hissab_expressions: [
      "cost_per_token = $0.10 / 1000000",
      "cost_per_request = 6000 * cost_per_token",
      "yearly_revenue_per_user = $50",
      "daily_revenue_per_user = yearly_revenue_per_user / (1 year to days)",
      "max_daily_requests = daily_revenue_per_user / cost_per_request",
    ],
  },
];
