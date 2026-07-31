import type { DiseaseInfo, ModelInfo } from './types';

export const diseaseDatabase: Record<string, DiseaseInfo> = {
  Normal: {
    name: 'Normal',
    description:
      'The ultrasound examination reveals no significant abnormalities in the ovarian tissue. Both ovaries appear normal in size, morphology, and echotexture. No cysts, follicular abnormalities, or suspicious masses were detected. The endometrial thickness and uterine appearance are within normal limits for the patient\'s age and menstrual phase.',
    symptoms: [
      'No clinical symptoms detected from imaging',
      'Regular menstrual cycles',
      'Normal ovarian volume and follicle count',
      'No evidence of hyperandrogenism on imaging',
    ],
    causes: [
      'Normal physiological ovarian function',
      'Regular ovulatory cycles',
      'Balanced hormonal environment',
    ],
    risk_factors: [
      'No identifiable risk factors from current imaging',
      'Recommend routine screening as per age-appropriate guidelines',
    ],
    investigations: [
      'Routine annual ultrasound screening',
      'Hormonal panel if clinically indicated (FSH, LH, Estradiol)',
      'Anti-Müllerian Hormone (AMH) for fertility assessment if desired',
    ],
    treatments: [
      'No treatment required based on current findings',
      'Maintain regular gynecological check-ups',
      'Continue healthy lifestyle practices',
    ],
    lifestyle: [
      'Maintain a balanced diet rich in fruits, vegetables, and whole grains',
      'Engage in regular physical activity (150 minutes/week)',
      'Maintain a healthy BMI',
      'Manage stress through mindfulness or yoga',
      'Ensure adequate sleep (7-9 hours per night)',
    ],
    follow_up: [
      'Next routine ultrasound in 12 months',
      'Annual gynecological examination',
      'Return if any new symptoms develop',
    ],
    summary:
      'The AI analysis indicates normal ovarian morphology with no detectable abnormalities. Both ovaries show regular size, normal follicular development, and unremarkable echotexture. No further intervention is required at this time. Routine follow-up is recommended as part of standard preventive care.',
  },
  PCOS: {
    name: 'PCOS (Polycystic Ovary Syndrome)',
    description:
      'The ultrasound findings are consistent with Polycystic Ovary Syndrome (PCOS). The affected ovary shows increased ovarian volume (>10 mL) with multiple small peripheral follicles (≥12 follicles measuring 2-9 mm in diameter) arranged in a "string of pearls" pattern. The stroma appears echogenic and increased. These findings, combined with clinical features, support the diagnosis of PCOS according to the Rotterdam criteria.',
    symptoms: [
      'Irregular menstrual cycles (oligomenorrhea or amenorrhea)',
      'Hyperandrogenism (hirsutism, acne, male-pattern hair loss)',
      'Multiple small follicles on ultrasound (≥12 per ovary)',
      'Enlarged ovaries (>10 mL volume)',
      'Insulin resistance and weight gain',
      'Difficulty conceiving (subfertility)',
      'Skin changes (acanthosis nigricans)',
    ],
    causes: [
      'Hormonal imbalance involving elevated androgens',
      'Insulin resistance leading to hyperinsulinemia',
      'Abnormal gonadotropin secretion (elevated LH/FSH ratio)',
      'Genetic predisposition and familial clustering',
      'Chronic low-grade inflammation',
    ],
    risk_factors: [
      'Family history of PCOS or type 2 diabetes',
      'Obesity or overweight status',
      'Sedentary lifestyle',
      'Insulin resistance',
      'Exposure to endocrine-disrupting chemicals',
      'Early pubarche or adrenarche',
    ],
    investigations: [
      'Transvaginal ultrasound (diagnostic imaging)',
      'Serum testosterone and free androgen index',
      'Fasting insulin and glucose tolerance test (HOMA-IR)',
      'LH, FSH, and LH/FSH ratio',
      'Sex hormone-binding globulin (SHBG)',
      'Anti-Müllerian Hormone (AMH) levels',
      'Lipid profile and liver function tests',
      'Thyroid function and prolactin to exclude other causes',
    ],
    treatments: [
      'Lifestyle modification as first-line therapy (diet and exercise)',
      'Metformin for insulin resistance (500-2000 mg/day)',
      'Combined oral contraceptives for menstrual regulation',
      'Letrozole for ovulation induction in fertility-seeking patients',
      'Spironolactone for hirsutism and hyperandrogenism',
      'Inositol supplementation (myo-inositol + D-chiro-inositol)',
      'Bariatric surgery in selected cases with severe obesity',
    ],
    lifestyle: [
      'Weight loss of 5-10% can significantly improve symptoms',
      'Low glycemic index diet to manage insulin resistance',
      'Regular aerobic and resistance exercise (150+ min/week)',
      'Reduce processed foods and refined sugars',
      'Consider Mediterranean or DASH diet',
      'Stress management and adequate sleep',
      'Limit caffeine and alcohol intake',
    ],
    follow_up: [
      'Follow-up ultrasound in 6 months to monitor ovarian changes',
      'Annual metabolic screening (glucose, lipids, HbA1c)',
      'Endometrial surveillance for endometrial hyperplasia risk',
      'Cardiovascular risk assessment annually',
      'Fertility evaluation if pregnancy desired',
      'Mental health screening for anxiety and depression',
    ],
    summary:
      'The AI model has detected characteristic features of Polycystic Ovary Syndrome (PCOS) on the ultrasound image. The affected ovary demonstrates increased volume with multiple peripheral follicles in a classic "string of pearls" arrangement and echogenic stroma. These imaging findings, combined with clinical correlation, are consistent with PCOS. Comprehensive metabolic and hormonal evaluation is recommended to confirm the diagnosis and guide management. Lifestyle modification should be initiated as first-line therapy.',
  },
  'Ovarian Cyst': {
    name: 'Ovarian Cyst',
    description:
      'The ultrasound examination reveals an ovarian cyst on the affected ovary. The cyst appears as a well-defined anechoic or hypoechoic structure with thin walls and posterior acoustic enhancement. Based on the imaging characteristics, the cyst appears to be a simple/functional cyst. The size, location, and morphological features have been analyzed. No features of malignancy (septations, solid components, papillary projections, or ascites) were identified.',
    symptoms: [
      'Pelvic pain or pressure (if cyst is large)',
      'Bloating or abdominal fullness',
      'Irregular menstrual bleeding',
      'Dyspareunia (pain during intercourse)',
      'Frequent urination if cyst compresses bladder',
      'Often asymptomatic and discovered incidentally',
    ],
    causes: [
      'Functional cysts (follicular or corpus luteum) from normal menstrual cycle',
      'Endometriomas from endometriosis',
      'Dermoid cysts (mature cystic teratomas)',
      'Hormonal imbalances (estrogen/progesterone)',
      'Ovulation induction medications',
    ],
    risk_factors: [
      'Reproductive age (most common in 20-40 age group)',
      'History of previous ovarian cysts',
      'Hormone therapy or fertility treatments',
      'Endometriosis',
      'Pregnancy (corpus luteum cysts)',
      'Hypothyroidism',
    ],
    investigations: [
      'Transvaginal and transabdominal ultrasound (gold standard)',
      'CA-125 blood test (to rule out malignancy in high-risk patients)',
      'HE4 and ROMA index for risk stratification',
      'Color Doppler to assess blood flow patterns',
      'MRI pelvis for complex cysts or indeterminate findings',
      'Beta-hCG to exclude ectopic pregnancy',
    ],
    treatments: [
      'Watchful waiting with serial ultrasounds for simple cysts <5 cm',
      'Combined oral contraceptives to prevent new cyst formation',
      'Pain management with NSAIDs for symptomatic relief',
      'Laparoscopic cystectomy for persistent or symptomatic cysts',
      'Oophorectomy for complex cysts with suspicious features',
      'Emergency surgery for torsion or rupture',
    ],
    lifestyle: [
      'Maintain a healthy weight and BMI',
      'Regular exercise to support hormonal balance',
      'Diet rich in anti-inflammatory foods (omega-3, antioxidants)',
      'Limit caffeine and alcohol',
      'Track menstrual cycles for irregularities',
      'Manage stress through relaxation techniques',
    ],
    follow_up: [
      'Repeat ultrasound in 6-8 weeks for functional cysts',
      'Follow-up in 3 months for persistent simple cysts',
      'Immediate evaluation if severe pain, fever, or rapid growth',
      'Annual ultrasound for recurrent cysts',
      'Monitor CA-125 if elevated or in high-risk patients',
    ],
    summary:
      'The AI analysis has identified an ovarian cyst on the affected ovary. The imaging characteristics suggest a benign simple cyst with no features of malignancy. The cyst shows well-defined borders and no internal solid components or septations. Conservative management with follow-up imaging is recommended. If the cyst persists, grows, or becomes symptomatic, further evaluation and possible surgical intervention may be warranted. Clinical correlation with symptoms and hormonal status is advised.',
  },
  Endometriosis: {
    name: 'Endometriosis',
    description:
      'The ultrasound findings are suggestive of endometriosis. The affected ovary shows an endometrioma (endometriotic cyst) appearing as a well-circumscribed cystic mass with homogeneous low-level internal echoes ("ground glass" echogenicity) and no internal vascularity on color Doppler. The cyst wall may show echogenic foci. These findings are characteristic of an ovarian endometrioma, a specific manifestation of endometriosis.',
    symptoms: [
      'Chronic pelvic pain (cyclical and non-cyclical)',
      'Severe dysmenorrhea (painful periods)',
      'Deep dyspareunia (pain during intercourse)',
      'Dyschezia (painful bowel movements, especially during menstruation)',
      'Dysuria during menstruation',
      'Infertility or subfertility',
      'Chronic fatigue',
    ],
    causes: [
      'Retrograde menstruation (Sampson\'s theory)',
      'Coelomic metaplasia of peritoneal cells',
      'Embryonic cell transformation',
      'Genetic and epigenetic factors',
      'Immune system dysfunction',
      'Endocrine-disrupting chemical exposure',
    ],
    risk_factors: [
      'Family history of endometriosis (5-8x increased risk)',
      'Early menarche and late menopause',
      'Short menstrual cycles (<27 days)',
      'Heavy menstrual bleeding',
      'Nulliparity (never given birth)',
      'Low body mass index',
      'Anomalies of the reproductive tract',
    ],
    investigations: [
      'Transvaginal ultrasound with specialist endometriosis protocol',
      'MRI pelvis for deep infiltrating endometriosis (DIE)',
      'CA-125 blood test (may be elevated)',
      'Diagnostic laparoscopy with histological confirmation (gold standard)',
      'Colonoscopy if bowel involvement suspected',
      'Cystoscopy if bladder involvement suspected',
    ],
    treatments: [
      'NSAIDs for pain management',
      'Hormonal therapy: combined oral contraceptives, progestins (dienogest)',
      'GnRH agonists/antagonists (leuprolide, elagolix)',
      'Laparoscopic excision surgery for endometriomas and DIE',
      'Ablation or excision of endometriotic implants',
      'Assisted reproductive technology (IVF) for infertility',
      'Hysterectomy with bilateral salpingo-oophorectomy in severe cases',
    ],
    lifestyle: [
      'Anti-inflammatory diet (omega-3, turmeric, green tea)',
      'Regular exercise to reduce pain and inflammation',
      'Acupuncture for pain management',
      'Heat therapy (heating pads) for pelvic pain',
      'Stress reduction techniques (CBT, meditation)',
      'Limit red meat and trans fats',
      'Adequate vitamin D and omega-3 supplementation',
    ],
    follow_up: [
      'Follow-up ultrasound every 6-12 months to monitor endometrioma',
      'Annual CA-125 monitoring',
      'Pain assessment and quality of life evaluation',
      'Fertility assessment if pregnancy desired',
      'Post-surgical follow-up at 3, 6, and 12 months',
      'Long-term hormonal therapy monitoring',
    ],
    summary:
      'The AI model has detected imaging features consistent with an ovarian endometrioma, a specific manifestation of endometriosis. The affected ovary shows a cystic mass with characteristic "ground glass" echogenicity and no internal vascularity, which is pathognomonic for endometriosis. Clinical correlation with symptoms such as dysmenorrhea, dyspareunia, and chronic pelvic pain is essential. Referral to a gynecologist specializing in endometriosis for comprehensive evaluation and management is recommended. Laparoscopic confirmation may be required for definitive diagnosis.',
  },
};

export const modelInfo: ModelInfo[] = [
  {
    name: 'CNN (Custom)',
    shortName: 'CNN',
    description:
      'A custom-built Convolutional Neural Network designed specifically for ovarian ultrasound image classification. Uses multiple convolutional layers with batch normalization and dropout for robust feature extraction.',
    accuracy: 87.3,
    precision: 86.8,
    recall: 87.1,
    f1Score: 86.9,
    color: '#ec4899',
  },
  {
    name: 'ResNet50',
    shortName: 'ResNet50',
    description:
      'Deep residual network with 50 layers using skip connections to address vanishing gradients. Pre-trained on ImageNet and fine-tuned on ovarian ultrasound images for transfer learning.',
    accuracy: 89.7,
    precision: 89.2,
    recall: 89.5,
    f1Score: 89.3,
    color: '#a855f7',
  },
  {
    name: 'DenseNet121',
    shortName: 'DenseNet121',
    description:
      'Densely connected network where each layer receives feature maps from all preceding layers. Excellent parameter efficiency and strong gradient flow for medical image analysis.',
    accuracy: 90.5,
    precision: 90.1,
    recall: 90.3,
    f1Score: 90.2,
    color: '#c026d3',
  },
  {
    name: 'EfficientNetV2-B0',
    shortName: 'EffV2-B0',
    description:
      'State-of-the-art architecture with compound scaling of depth, width, and resolution. Uses progressive learning and fused MBConv blocks for efficient training and superior accuracy.',
    accuracy: 92.1,
    precision: 91.8,
    recall: 92.0,
    f1Score: 91.9,
    color: '#f59e0b',
  },
  {
    name: 'EfficientNetV2-B0 + SVM',
    shortName: 'EffV2+SVM',
    description:
      'Hybrid approach using EfficientNetV2-B0 as a feature extractor with a Support Vector Machine classifier. Combines deep learning feature extraction with classical ML classification.',
    accuracy: 93.4,
    precision: 93.1,
    recall: 93.2,
    f1Score: 93.1,
    color: '#ef4444',
  },
  {
    name: 'EfficientNetV2-B0 + XGBoost',
    shortName: 'EffV2+XGB',
    description:
      'Best-performing model combining EfficientNetV2-B0 feature extraction with XGBoost gradient-boosted tree classifier. Achieves highest accuracy through ensemble of deep and tree-based methods.',
    accuracy: 94.2,
    precision: 94.0,
    recall: 93.9,
    f1Score: 93.9,
    color: '#7c3aed',
  },
];

export function getDiseaseInfo(diseaseName: string): DiseaseInfo {
  if (diseaseName.includes('PCOS') || diseaseName.includes('Polycystic')) {
    return diseaseDatabase.PCOS;
  }
  if (diseaseName.includes('Cyst')) {
    return diseaseDatabase['Ovarian Cyst'];
  }
  if (diseaseName.includes('Endometri')) {
    return diseaseDatabase.Endometriosis;
  }
  return diseaseDatabase.Normal;
}
