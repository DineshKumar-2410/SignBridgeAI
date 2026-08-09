/**
 * ISL Alphabet Descriptions (A–Z)
 * Each entry contains:
 *  - description: Human-readable gesture description
 *  - hands: which hand(s) are used ('both' | 'right' | 'left')
 *  - pose: finger fold angles for the 3D avatar
 *    Format: [Thumb, Index, Middle, Ring, Pinky] each as [base, mid, tip]
 *    0 = fully extended, 1.5 = fully curled
 */

export interface ISLLetterData {
  letter: string;
  description: string;
  hands: 'both' | 'right' | 'left';
  /** [Thumb, Index, Middle, Ring, Pinky] -> [base, mid, tip] -- right hand */
  rightPose: number[][];
  /** [Thumb, Index, Middle, Ring, Pinky] -> [base, mid, tip] -- left hand (undefined = fullOpen) */
  leftPose?: number[][];
}

const fullOpen: number[][] = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
const closedFist: number[][] = [[0,1.5,0],[1.5,1.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5]];
const pointIndex: number[][] = [[0,1.5,0],[0,0,0],[1.5,1.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5]];
const pointTwo: number[][] = [[0,1.5,0],[0,0,0],[0,0,0],[1.5,1.5,1.5],[1.5,1.5,1.5]];
const flatHand: number[][] = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
const pinkyOnly: number[][] = [[0,1.5,0],[1.5,1.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5],[0,0,0]];
const hookIndex: number[][] = [[0,1.5,0],[0.8,0.8,0.8],[1.5,1.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5]];
const cShape: number[][] = [[0,0.5,0.5],[0.5,0.5,0.5],[0.5,0.5,0.5],[0.5,0.5,0.5],[0.5,0.5,0.5]];
const oShape: number[][] = [[0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0],[1.0,1.0,1.0]];
const phoneShape: number[][] = [[0,0,0],[1.5,1.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5],[0,0,0]];
const vShape: number[][] = [[0,1.5,0],[0,0,0],[0,0,0],[1.5,1.5,1.5],[1.5,1.5,1.5]];
const threeFingers: number[][] = [[0,1.5,0],[0,0,0],[0,0,0],[0,0,0],[1.5,1.5,1.5]];
const lShape: number[][] = [[0,0,0],[0,0,0],[1.5,1.5,1.5],[1.5,1.5,1.5],[1.5,1.5,1.5]];

export const ISL_ALPHABET: ISLLetterData[] = [
  {
    letter: 'A',
    description:
      'Both palms face forward side-by-side with fingers fully extended upwards. The thumbs are extended outwards toward each other so that the sides of the thumbs touch or rest adjacent in the center.',
    hands: 'both',
    rightPose: flatHand,
    leftPose: flatHand,
  },
  {
    letter: 'B',
    description:
      'Extend the index and middle fingers of both hands. Bring both hands together so the index and middle fingers of the right hand cross over the index and middle fingers of the left hand, forming a hash or box shape (#).',
    hands: 'both',
    rightPose: pointTwo,
    leftPose: pointTwo,
  },
  {
    letter: 'C',
    description:
      'Curve the right hand fingers and thumb into an open "C" shape (facing inward or to the side). Alternatively, use both hands with curved fingers touching at the tips and wrist bases to form a large circle/C shape.',
    hands: 'right',
    rightPose: cShape,
  },
  {
    letter: 'D',
    description:
      "The left hand extends its index finger vertically upward (acting as the straight stem of the 'D'). The right hand forms a curved arc with its thumb and index finger touching the top and bottom of the left index finger to complete the 'D' loop.",
    hands: 'both',
    rightPose: cShape,
    leftPose: pointIndex,
  },
  {
    letter: 'E',
    description:
      'Extend the left index finger horizontally or vertically. Place the tip of the right index finger onto the tip of the left index finger.',
    hands: 'both',
    rightPose: pointIndex,
    leftPose: pointIndex,
  },
  {
    letter: 'F',
    description:
      'Extend the left index and middle fingers together horizontally or vertically. Touch the tips of the right index and middle fingers to the tips of the left index and middle fingers.',
    hands: 'both',
    rightPose: pointTwo,
    leftPose: pointTwo,
  },
  {
    letter: 'G',
    description:
      'Both hands are formed into fists. Place the right fist directly on top of the left fist.',
    hands: 'both',
    rightPose: closedFist,
    leftPose: closedFist,
  },
  {
    letter: 'H',
    description:
      'Hold the left hand flat with the palm facing up or inward. Sweep the flat right hand palm across the left palm from wrist to fingertips.',
    hands: 'both',
    rightPose: flatHand,
    leftPose: flatHand,
  },
  {
    letter: 'I',
    description:
      'Extend the left index finger vertically upward. Place the tip of the right index finger onto the tip of the left index finger (or touch the top of the left index finger).',
    hands: 'both',
    rightPose: pointIndex,
    leftPose: pointIndex,
  },
  {
    letter: 'J',
    description:
      'Extend the right pinky finger (or index finger) and draw the letter "J" in the air.',
    hands: 'right',
    rightPose: pinkyOnly,
  },
  {
    letter: 'K',
    description:
      "Extend the left index finger vertically upward. Form a \"V\" shape with the right index and middle fingers, placing the right index finger against the middle of the left index finger (forming the side arms of a 'K').",
    hands: 'both',
    rightPose: vShape,
    leftPose: pointIndex,
  },
  {
    letter: 'L',
    description:
      'Hold the right hand up with the thumb and index finger extended at a 90-degree angle, forming the shape of an "L".',
    hands: 'right',
    rightPose: lShape,
  },
  {
    letter: 'M',
    description:
      'Hold the left hand flat horizontally with palm facing up. Place the tips of three fingers (index, middle, ring) of the right hand onto the palm of the left hand.',
    hands: 'both',
    rightPose: threeFingers,
    leftPose: flatHand,
  },
  {
    letter: 'N',
    description:
      'Hold the left hand flat horizontally with palm facing up. Place the tips of two fingers (index and middle) of the right hand onto the palm of the left hand.',
    hands: 'both',
    rightPose: pointTwo,
    leftPose: flatHand,
  },
  {
    letter: 'O',
    description:
      'Touch the tip of the right index finger to the tip of the left index finger, while both thumbs also touch at the bottom, creating a full ring/circle ("O") with both hands.',
    hands: 'both',
    rightPose: oShape,
    leftPose: oShape,
  },
  {
    letter: 'P',
    description:
      'Hold the left index finger pointing straight up. Form a circular loop with the right index finger and thumb, touching the top tip of the left index finger.',
    hands: 'both',
    rightPose: oShape,
    leftPose: pointIndex,
  },
  {
    letter: 'Q',
    description:
      'Form a circle with the thumb and index finger of the left hand. Hook or insert the right index finger into the bottom of the loop.',
    hands: 'both',
    rightPose: hookIndex,
    leftPose: oShape,
  },
  {
    letter: 'R',
    description:
      'Hold the left hand flat with the palm facing up. Curve the right hand index finger into a hook shape and rest it on the left palm.',
    hands: 'both',
    rightPose: hookIndex,
    leftPose: flatHand,
  },
  {
    letter: 'S',
    description:
      'Extend the pinky finger of the left hand and the pinky finger of the right hand, then hook them together.',
    hands: 'both',
    rightPose: pinkyOnly,
    leftPose: pinkyOnly,
  },
  {
    letter: 'T',
    description:
      'Hold the left hand flat vertically with the palm facing inward (edge pointing forward). Touch the tip of the right index finger against the lower edge or base of the left palm.',
    hands: 'both',
    rightPose: pointIndex,
    leftPose: flatHand,
  },
  {
    letter: 'U',
    description:
      'Extend the left index finger vertically upward. Place the tip of the right index finger onto the tip of the left index finger, while keeping both middle fingers extended alongside.',
    hands: 'both',
    rightPose: pointTwo,
    leftPose: pointIndex,
  },
  {
    letter: 'V',
    description:
      'Extend the index and middle fingers of the right hand into a "V" shape and place them onto the flat palm of the left hand.',
    hands: 'both',
    rightPose: vShape,
    leftPose: flatHand,
  },
  {
    letter: 'W',
    description:
      'Interlock the fingers of both hands together with fingertips pointing upward or cross both wrists with extended fingers.',
    hands: 'both',
    rightPose: flatHand,
    leftPose: flatHand,
  },
  {
    letter: 'X',
    description:
      'Cross the index fingers of both hands over each other to form an "X" shape.',
    hands: 'both',
    rightPose: pointIndex,
    leftPose: pointIndex,
  },
  {
    letter: 'Y',
    description:
      'Extend the left hand palm flat with the palm facing up. Extend the right hand thumb and pinky finger out (forming a phone shape) and place the right thumb into the center of the left palm.',
    hands: 'both',
    rightPose: phoneShape,
    leftPose: flatHand,
  },
  {
    letter: 'Z',
    description:
      "Hold the left hand flat with palm open facing sideways. Place the edge/side of the flat right hand perpendicular against the left palm, forming a 'Z' profile.",
    hands: 'both',
    rightPose: flatHand,
    leftPose: flatHand,
  },
];

/** Quick lookup map: letter -> ISLLetterData */
export const ISL_ALPHABET_MAP: Record<string, ISLLetterData> = Object.fromEntries(
  ISL_ALPHABET.map((d) => [d.letter, d])
);
