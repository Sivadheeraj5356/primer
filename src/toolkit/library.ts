import type { WS } from './types'

export interface LibItem {
  id: string
  country: 'India' | 'United States' | 'United Arab Emirates'
  curriculum: string
  subject: string
  grade: number
  minutes: string
  tag?: string
  ws: WS
}

const mc = (q: string, options: string[], answer: string, explanation = '') => ({ type: 'mcq' as const, q, options, answer, explanation })
const fill = (q: string, answer: string) => ({ type: 'fill' as const, q, answer })
const tf = (q: string, answer: 'True' | 'False', explanation = '') => ({ type: 'tf' as const, q, answer, explanation })

export const LIBRARY: LibItem[] = [
  {
    id: 'cbse-g3-nouns', country: 'India', curriculum: 'CBSE', subject: 'English', grade: 3, minutes: '15 to 20 min',
    ws: {
      title: 'Grade 3: Nouns and Pronouns', instructions: 'Read each question and choose or write the best answer.',
      questions: [
        mc('Which word is a noun? "The dog ran fast."', ['ran', 'fast', 'dog', 'the'], 'dog', 'A noun names a person, animal, place or thing.'),
        mc('Pick the proper noun.', ['city', 'Mumbai', 'river', 'teacher'], 'Mumbai', 'Proper nouns name a particular place or person and start with a capital letter.'),
        fill('Replace the underlined noun with a pronoun: "Riya likes mangoes. ______ eats one every day."', 'She'),
        fill('"The boys are playing. ______ are happy." Fill in the pronoun.', 'They'),
        mc('Which word is a pronoun?', ['table', 'he', 'garden', 'Delhi'], 'he'),
        tf('"Pen" is a common noun.', 'True', 'It names a thing, not one particular pen.'),
        tf('"We" is a noun.', 'False', '"We" is a pronoun; it stands in for nouns.'),
        { type: 'match', q: 'Match each noun with its kind.', pairs: [{ left: 'Priya', right: 'Proper noun' }, { left: 'school', right: 'Common noun' }, { left: 'flock', right: 'Collective noun' }, { left: 'honesty', right: 'Abstract noun' }] },
      ],
      funFact: 'The word "pronoun" means "for a noun" - it takes the place of one.',
      brainTeaser: { q: 'I am a noun that names a place where you borrow books. What am I?', a: 'A library.' },
    },
  },
  {
    id: 'cc-g3-conventions', country: 'United States', curriculum: 'Common Core', subject: 'Language Arts', grade: 3, minutes: '12 to 18 min',
    ws: {
      title: 'Grade 3: Language Conventions', instructions: 'Fix the punctuation and capital letters.',
      questions: [
        mc('Which sentence is written correctly?', ['we went to paris in july.', 'We went to Paris in July.', 'we went to Paris in july', 'We went to paris in July.'], 'We went to Paris in July.', 'Sentences start with a capital letter. Names of places and months are capitalized.'),
        mc('Which punctuation mark ends a question?', ['.', '!', '?', ','], '?'),
        fill('Add the missing mark: "What time is it______"', '?'),
        fill('Write the contraction for "do not": ______', "don't"),
        tf('A comma is used to separate items in a list.', 'True'),
        mc('Which is correct?', ['My sisters toy is red.', "My sister's toy is red.", "My sisters' toy's is red.", 'My sisters toy, is red.'], "My sister's toy is red.", 'The apostrophe shows that the toy belongs to one sister.'),
        fill('Capitalize the days correctly: "we have art on friday." Write the corrected sentence.', 'We have art on Friday.'),
        tf('Titles of books start and end with a capital letter only.', 'False', 'Main words in a title are capitalized.'),
      ],
      funFact: 'The exclamation mark was once called the "note of admiration".',
      brainTeaser: { q: 'What has a period but is not a sentence?', a: 'A period of time, or the dot at the end of a sentence.' },
    },
  },
  {
    id: 'uae-g3-moral', country: 'United Arab Emirates', curriculum: 'UAE MOE', subject: 'Moral Education', grade: 3, minutes: '20 to 25 min',
    tag: 'Bilingual',
    ws: {
      title: 'Grade 3: Moral Education / التربية الأخلاقية', instructions: 'Choose the best answer. اختر الإجابة الأنسب.',
      questions: [
        mc('Honesty means... / الصدق يعني...', ['Telling the truth / قول الحقيقة', 'Hiding mistakes / إخفاء الأخطاء', 'Taking things / أخذ الأشياء', 'Staying silent / الصمت'], 'Telling the truth / قول الحقيقة'),
        mc('A classmate is sad. What is kind? / زميل حزين. ما التصرف اللطيف؟', ['Ignore him / تجاهله', 'Ask if he is okay / سؤاله إن كان بخير', 'Laugh / الضحك', 'Walk away / الابتعاد'], 'Ask if he is okay / سؤاله إن كان بخير'),
        tf('Sharing with others makes friendships stronger. / المشاركة مع الآخرين تقوي الصداقة.', 'True'),
        tf('Respect is only for adults. / الاحترام للكبار فقط.', 'False', 'We respect everyone. نحترم الجميع.'),
        fill('Working together as a team is called ______. (cooperation) / العمل معاً كفريق يسمى ______', 'cooperation / التعاون'),
        mc('You find a lost pencil case. What should you do? / وجدت حقيبة أقلام ضائعة. ماذا تفعل؟', ['Keep it / تحتفظ بها', 'Give it to the teacher / تعطيها للمعلم', 'Throw it / ترميها', 'Hide it / تخبئها'], 'Give it to the teacher / تعطيها للمعلم'),
        { type: 'match', q: 'Match the value with its meaning. / صل القيمة بمعناها.', pairs: [{ left: 'Honesty / الصدق', right: 'Telling the truth' }, { left: 'Kindness / اللطف', right: 'Caring for others' }, { left: 'Sharing / المشاركة', right: 'Giving part of what we have' }, { left: 'Respect / الاحترام', right: 'Treating others politely' }] },
      ],
      funFact: 'Many languages have a saying that honesty is the best policy.',
    },
  },
  {
    id: 'cbse-g4-maths-fractions', country: 'India', curriculum: 'CBSE', subject: 'Maths', grade: 4, minutes: '15 min',
    ws: {
      title: 'Grade 4: Fractions', instructions: 'Answer each question.',
      questions: [
        mc('Which fraction is the same as one half?', ['1/3', '2/4', '3/5', '1/4'], '2/4'),
        mc('Which is greater?', ['1/2', '1/4', 'They are equal', 'Cannot say'], '1/2', 'Halves are bigger pieces than quarters.'),
        fill('3/4 + 1/4 = ______', '1 (or 4/4)'),
        fill('Write 6/8 in simplest form: ______', '3/4'),
        tf('In 5/9, the denominator is 5.', 'False', 'The denominator is the bottom number: 9.'),
        mc('A pizza is cut into 8 equal slices. You eat 3. What fraction did you eat?', ['3/5', '3/8', '8/3', '5/8'], '3/8'),
        fill('2/5 of 20 = ______', '8'),
        { type: 'match', q: 'Match each fraction with its decimal.', pairs: [{ left: '1/2', right: '0.5' }, { left: '1/4', right: '0.25' }, { left: '3/4', right: '0.75' }, { left: '1/10', right: '0.1' }] },
      ],
      funFact: 'Ancient Egyptians wrote most fractions as sums of unit fractions like 1/2 and 1/3.',
      brainTeaser: { q: 'If you cut a cake in half twice, how many pieces do you have?', a: 'Four pieces.' },
    },
  },
  {
    id: 'cc-g2-plants', country: 'United States', curriculum: 'Common Core', subject: 'Science', grade: 2, minutes: '10 to 15 min',
    ws: {
      title: 'Grade 2: Plants and What They Need', instructions: 'Choose the best answer.',
      questions: [
        mc('Which part of a plant takes in water from the soil?', ['Leaf', 'Root', 'Flower', 'Fruit'], 'Root'),
        mc('What do plants need to grow?', ['Water, light and air', 'Candy', 'Plastic', 'Loud music'], 'Water, light and air'),
        tf('Leaves help the plant make food.', 'True'),
        tf('Plants can grow well in a dark cupboard for months.', 'False', 'Plants need light to make their food.'),
        fill('A seed grows into a new ______.', 'plant'),
        mc('Which part holds the plant up?', ['Stem', 'Seed', 'Petal', 'Bud'], 'Stem'),
        { type: 'match', q: 'Match the plant part with its job.', pairs: [{ left: 'Root', right: 'Takes in water' }, { left: 'Stem', right: 'Holds the plant up' }, { left: 'Leaf', right: 'Makes food using sunlight' }, { left: 'Flower', right: 'Makes seeds' }] },
      ],
      funFact: 'Bamboo is a grass and some kinds can grow almost a metre in one day.',
    },
  },
  {
    id: 'icse-g5-water-cycle', country: 'India', curriculum: 'ICSE', subject: 'EVS', grade: 5, minutes: '15 min',
    ws: {
      title: 'Grade 5: The Water Cycle', instructions: 'Answer each question.',
      questions: [
        mc('What is it called when water changes from liquid to vapour?', ['Condensation', 'Evaporation', 'Precipitation', 'Collection'], 'Evaporation'),
        mc('Which energy source drives the water cycle?', ['The Sun', 'The Moon', 'Wind only', 'Electricity'], 'The Sun'),
        fill('Water vapour cools and turns into tiny droplets to form clouds. This is called ______.', 'condensation'),
        fill('Rain, snow and hail are forms of ______.', 'precipitation'),
        tf('The amount of water on Earth is constantly being used up completely.', 'False', 'Water is recycled and moves between forms.'),
        mc('Where does most of the evaporated water come from?', ['Oceans', 'Puddles only', 'Deserts', 'Wells'], 'Oceans'),
        { type: 'short', q: 'Explain in two sentences why puddles disappear on a sunny day.', answer: 'The Sun warms the water so it evaporates into water vapour in the air.' },
        { type: 'match', q: 'Match the stage with what happens.', pairs: [{ left: 'Evaporation', right: 'Water becomes vapour' }, { left: 'Condensation', right: 'Vapour forms clouds' }, { left: 'Precipitation', right: 'Water falls to Earth' }, { left: 'Collection', right: 'Water gathers in rivers and seas' }] },
      ],
      funFact: 'The water you drink today may once have been drunk by a dinosaur.',
      brainTeaser: { q: 'I fall but never get hurt. I rise without wings. What am I?', a: 'Rain (it falls, then evaporates and rises).' },
    },
  },
]
