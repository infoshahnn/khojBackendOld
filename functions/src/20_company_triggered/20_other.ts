import * as functions from "firebase-functions";
// import { createViewCompanyNotificationSupporting } from "..";
// import { onRequest } from "firebase-functions/v2/https";
// import { logger } from "firebase-functions";
import admin = require('firebase-admin');
import { getGroupFromDbUsingPin, getNameArray, getOnlyLettersLowerCase, incrementReadWriteCounts, incrementReadWriteNSelfV2, logError, log_c, restrictedNumbersList } from "..";
// import { nSelfForCompany } from "..";
let usersCollectionString = 'testCollectionUsers';
let companiesCollectionStringV2 = 'companiesV2';

// let warehousesCollectionString = 'warehouses';
// let transportersCollectionString = 'transporters';

let postsCollectionString = 'posts';


const pointsVerifiedLow: number = 2
const pointsVerifiedMedium: number = 2
const pointsVerifiedHigh: number = 2
const pointsSponsoredBronze: number = 2
const pointsSponsoredSilver: number = 4000 // most premium
const pointsSponsoredGold: number = 12
const pointsSponsoredDiamond: number = 15
// const pointsForEachDirect: number = 10
// const pointsForEachMutual: number = 2
const pointsShortDescription: number = 1


const groupsGlobal: Array<String> = [
    'Andaman And Nicobar Islands > Andaman And Nicobar Islands',
    'Andhra Pradesh > Anantapur',
    'Andhra Pradesh > Chittoor, Spsr Nellore, Y.S.R.',
    'Andhra Pradesh > East Godavari, West Godavari',
    'Andhra Pradesh > Guntur, Krishna',
    'Andhra Pradesh > Kurnool, Prakasam',
    'Andhra Pradesh > Srikakulam, Vizianagaram',
    'Andhra Pradesh > Visakhapatanam',
    'Arunachal Pradesh > Anjaw, Changlang, Lohit, Longding, Namsai, Tirap',
    'Arunachal Pradesh > Dibang Valley, Lower Dibang Valley',
    'Arunachal Pradesh > East Kameng, Pakke Kessang, West Kameng',
    'Arunachal Pradesh > East Siang, Leparada, Lower Siang, Shi Yomi, Siang, Upper Siang, West Siang',
    'Arunachal Pradesh > Kamle, Kra Daadi, Lower Subansiri, Upper Subansiri',
    'Arunachal Pradesh > Kurung Kumey',
    'Arunachal Pradesh > Papum Pare',
    'Arunachal Pradesh > Tawang',
    'Assam > Baksa, Barpeta, Chirang, Kamrup, Kamrup Metro, Nalbari',
    'Assam > Biswanath, Darrang, Hojai, Nagaon, Sonitpur, Udalguri',
    'Assam > Bongaigaon, Goalpara',
    'Assam > Cachar, Dima Hasao, Hailakandi, Karbi Anglong, Karimganj, West Karbi Anglong',
    'Assam > Charaideo, Dhemaji, Dibrugarh, Majuli, Sivasagar, Tinsukia',
    'Assam > Dhubri, Kokrajhar, South Salmara Mancachar',
    'Assam > Golaghat, Jorhat',
    'Assam > Lakhimpur',
    'Assam > Marigaon',
    'Bihar > Araria, Kishanganj, Madhubani, Supaul',
    'Bihar > Arwal, Gaya, Jehanabad, Nalanda, Nawada',
    'Bihar > Aurangabad (Bh), Bhojpur, Buxar, Kaimur (Bhabua), Rohtas',
    'Bihar > Banka, Bhagalpur, Katihar, Khagaria, Purnia',
    'Bihar > Begusarai, Jamui, Lakhisarai, Munger, Sheikhpura',
    'Bihar > Darbhanga, Madhepura, Saharsa, Samastipur',
    'Bihar > Gopalganj, Pashchim Champaran, Purbi Champaran, Sheohar, Siwan',
    'Bihar > Muzaffarpur, Patna, Saran, Sitamarhi, Vaishali',
    'Chandigarh > Chandigarh',
    'Chhattisgarh > Balod, Durg, Rajnandgaon',
    'Chhattisgarh > Baloda Bazar, Mahasamund, Raipur',
    'Chhattisgarh > Balrampur (Cg), Jashpur, Korea, Surajpur, Surguja',
    'Chhattisgarh > Bastar, Kondagaon, Narayanpur',
    'Chhattisgarh > Bemetara, Bilaspur (Cg), Gaurella Pendra Marwahi, Kabirdham, Mungeli',
    'Chhattisgarh > Bijapur, Dantewada, Sukma',
    'Chhattisgarh > Dhamtari, Gariyaband, Kanker',
    'Chhattisgarh > Janjgir-Champa, Korba, Raigarh (Cg)',
    'Delhi > Delhi',
    'Goa > Goa',
    'Gujarat > Ahmadabad, Arvalli, Gandhinagar, Kheda, Mahisagar',
    'Gujarat > Amreli, Bhavnagar, Botad',
    'Gujarat > Anand, Chhotaudepur, Dohad, Panch Mahals, Vadodara',
    'Gujarat > Banas Kantha, Kachchh, Mahesana, Patan, Sabar Kantha',
    'Gujarat > Bharuch, Narmada, Surat',
    'Gujarat > Dang, Navsari, Tapi, Valsad',
    'Gujarat > Devbhumi Dwarka, Jamnagar, Porbandar',
    'Gujarat > Gir Somnath, Junagadh, Morbi, Rajkot, Surendranagar',
    'Haryana > Ambala, Panchkula',
    'Haryana > Bhiwani, Charki Dadri, Mahendragarh',
    'Haryana > Faridabad, Gurugram, Nuh, Palwal, Rewari',
    'Haryana > Fatehabad, Hisar, Sirsa',
    'Haryana > Jhajjar, Rohtak, Sonipat',
    'Haryana > Jind, Kaithal',
    'Haryana > Karnal, Panipat',
    'Haryana > Kurukshetra, Yamunanagar',
    'Himachal Pradesh > Bilaspur (Hp), Solan',
    'Himachal Pradesh > Chamba, Kangra',
    'Himachal Pradesh > Hamirpur (Hp), Una',
    'Himachal Pradesh > Kinnaur, Lahul And Spiti',
    'Himachal Pradesh > Kullu, Mandi',
    'Himachal Pradesh > Shimla, Sirmaur',
    'Jammu And Kashmir > Anantnag, Doda, Kishtwar, Ramban',
    'Jammu And Kashmir > Bandipora, Baramulla, Kulgam, Kupwara, Poonch, Rajouri, Shopian',
    'Jammu And Kashmir > Budgam, Ganderbal, Pulwama, Srinagar',
    'Jammu And Kashmir > Jammu, Kathua, Reasi, Samba, Udhampur',
    'Jharkhand > Bokaro, Hazaribagh, Ramgarh',
    'Jharkhand > Chatra, Garhwa, Palamu',
    'Jharkhand > Deoghar, Dumka, Jamtara',
    'Jharkhand > Dhanbad, Giridih, Koderma',
    'Jharkhand > East Singhbum, Ranchi, Saraikela Kharsawan',
    'Jharkhand > Godda, Pakur, Sahebganj',
    'Jharkhand > Gumla, Latehar, Lohardaga',
    'Jharkhand > Khunti, Simdega, West Singhbhum',
    'Karnataka > Bagalkote, Belagavi, Raichur',
    'Karnataka > Ballari, Bidar, Davangere, Kalaburagi, Vijayapura, Yadgir',
    'Karnataka > Bengaluru Rural, Bengaluru Urban, Chikkaballapura, Kolar',
    'Karnataka > Chamarajanagara, Mandya, Mysuru, Ramanagara',
    'Karnataka > Chikkamagaluru, Dakshina Kannada, Hassan, Kodagu, Tumakuru',
    'Karnataka > Chitradurga, Shivamogga, Udupi',
    'Karnataka > Dharwad, Gadag, Koppal',
    'Karnataka > Haveri, Uttara Kannada',
    'Kerala > Alappuzha',
    'Kerala > Ernakulam, Idukki, Kottayam',
    'Kerala > Kannur, Kasaragod',
    'Kerala > Kollam',
    'Kerala > Kozhikode, Wayanad',
    'Kerala > Malappuram',
    'Kerala > Palakkad, Thrissur',
    'Kerala > Pathanamthitta',
    'Kerala > Thiruvananthapuram',
    'Ladakh > Ladakh',
    'Lakshadweep > Lakshadweep',
    'Madhya Pradesh > Agar Malwa, Jhabua, Mandsaur, Neemuch, Ratlam, Shajapur, Ujjain',
    'Madhya Pradesh > Alirajpur, Barwani, Burhanpur, Dewas, Dhar, East Nimar, Harda, Indore, Khargone, Sehore',
    'Madhya Pradesh > Anuppur, Dindori, Mandla',
    'Madhya Pradesh > Ashoknagar, Bhopal, Guna, Raisen, Rajgarh, Sagar, Vidisha',
    'Madhya Pradesh > Balaghat, Betul, Chhindwara, Hoshangabad, Narsinghpur, Seoni',
    'Madhya Pradesh > Bhind, Datia, Gwalior, Morena, Sheopur, Shivpuri',
    'Madhya Pradesh > Chhatarpur, Damoh, Jabalpur, Katni, Niwari, Panna, Tikamgarh',
    'Madhya Pradesh > Rewa, Satna, Shahdol, Sidhi, Singrauli, Umaria',
    'Maharashtra > Ahmednagar, Dhule, Jalgaon, Nandurbar, Nashik',
    'Maharashtra > Akola, Amravati, Buldhana, Washim, Yavatmal',
    'Maharashtra > Aurangabad (Mh), Beed, Hingoli, Jalna, Latur, Nanded, Osmanabad, Parbhani',
    'Maharashtra > Bhandara, Chandrapur, Gadchiroli, Gondia, Nagpur, Wardha',
    'Maharashtra > Kolhapur, Pune, Sangli, Satara, Solapur',
    'Maharashtra > Mumbai, Mumbai Suburban, Palghar, Raigad, Ratnagiri, Sindhudurg, Thane',
    'Manipur > Bishnupur, Kakching',
    'Manipur > Chandel, Churachandpur, Jiribam, Noney, Pherzawl',
    'Manipur > Imphal East, Imphal West, Kangpokpi, Thoubal',
    'Manipur > Kamjong, Tengnoupal, Ukhrul',
    'Manipur > Senapati, Tamenglong',
    'Meghalaya > East Garo Hills, North Garo Hills, South Garo Hills, South West Garo Hills, West Garo Hills',
    'Meghalaya > East Jaintia Hills, West Jaintia Hills',
    'Meghalaya > East Khasi Hills, Ri Bhoi, South West Khasi Hills, West Khasi Hills',
    'Mizoram > Mizoram',
    'Nagaland > Nagaland',
    'Odisha > Anugul, Bargarh, Boudh, Deogarh, Dhenkanal, Sonepur',
    'Odisha > Balangir, Kalahandi, Nuapada',
    'Odisha > Baleshwar, Kendujhar, Mayurbhanj',
    'Odisha > Bhadrak, Jajapur, Kendrapara',
    'Odisha > Cuttack, Jagatsinghapur, Khordha, Puri',
    'Odisha > Gajapati, Ganjam, Kandhamal, Nayagarh',
    'Odisha > Jharsuguda, Sambalpur, Sundargarh',
    'Odisha > Koraput, Malkangiri, Nabarangpur, Rayagada',
    'Puducherry > Puducherry',
    'Punjab > Amritsar, Firozepur, Tarn Taran',
    'Punjab > Barnala, Bathinda, Ludhiana, Moga',
    'Punjab > Faridkot, Fazilka, Sri Muktsar Sahib',
    'Punjab > Fatehgarh Sahib, Rupnagar, Shahid Bhagat Singh Nagar',
    'Punjab > Gurdaspur, Hoshiarpur, Pathankot',
    'Punjab > Jalandhar, Kapurthala',
    'Punjab > Malerkotla, Mansa, Patiala, S.A.S Nagar, Sangrur',
    'Rajasthan > Ajmer, Bhilwara, Pali, Rajsamand',
    'Rajasthan > Alwar, Dausa, Jaipur, Tonk',
    'Rajasthan > Banswara, Chittorgarh, Dungarpur, Pratapgarh (Rj), Sirohi, Udaipur',
    'Rajasthan > Baran, Bundi, Jhalawar, Kota',
    'Rajasthan > Barmer, Jaisalmer, Jalore, Jodhpur',
    'Rajasthan > Bharatpur, Dholpur, Karauli, Sawai Madhopur',
    'Rajasthan > Bikaner, Churu, Ganganagar, Hanumangarh',
    'Rajasthan > Jhunjhunu, Nagaur, Sikar',
    'Sikkim > Sikkim',
    'Tamil Nadu > Ariyalur, Cuddalore, Perambalur, Tiruchirappalli',
    'Tamil Nadu > Chengalpattu, Chennai, Kanchipuram, Ranipet, Thiruvallur, Vellore',
    'Tamil Nadu > Coimbatore, Dindigul, Karur, The Nilgiris, Tiruppur',
    'Tamil Nadu > Dharmapuri, Kallakurichi, Krishnagiri, Tiruvannamalai, Villupuram',
    'Tamil Nadu > Erode, Namakkal, Salem',
    'Tamil Nadu > Kanniyakumari, Tenkasi, Tirunelveli, Tuticorin, Virudhunagar',
    'Tamil Nadu > Madurai, Ramanathapuram, Sivaganga, Theni, Tirupathur',
    'Tamil Nadu > Mayiladuthurai, Nagapattinam, Pudukkottai, Thanjavur, Thiruvarur',
    'Telangana > Adilabad, Kumuram Bheem Asifabad, Mancherial, Nirmal',
    'Telangana > Bhadradri Kothagudem, Jangoan, Khammam, Mahabubabad, Mulugu, Warangal Rural, Warangal Urban',
    'Telangana > Hyderabad, Jogulamba Gadwal, Mahabubnagar, Nagarkurnool, Narayanpet, Wanaparthy',
    'Telangana > Jagitial, Jayashankar Bhupalapally, Kamareddy, Karimnagar, Nizamabad, Peddapalli, Rajanna Sircilla',
    'Telangana > Medak, Medchal Malkajgiri, Ranga Reddy, Sangareddy, Siddipet, Vikarabad',
    'Telangana > Nalgonda, Suryapet, Yadadri Bhuvanagiri',
    'The Dadra And Nagar Haveli And Daman And Diu > The Dadra And Nagar Haveli And Daman And Diu',
    'Tripura > Tripura',
    'Uttar Pradesh > Agra, Bareilly, Budaun, Etah, Firozabad, Hathras, Kasganj, Mathura, Pilibhit, Shahjahanpur',
    'Uttar Pradesh > Aligarh, Amroha, Bulandshahr, Gautam Buddha Nagar, Ghaziabad, Hapur, Sambhal',
    'Uttar Pradesh > Ambedkar Nagar, Azamgarh, Basti, Deoria, Gorakhpur, Kushi Nagar, Maharajganj, Sant Kabeer Nagar',
    'Uttar Pradesh > Amethi, Ayodhya, Balrampur (Up), Gonda, Shravasti, Siddharth Nagar, Sultanpur',
    'Uttar Pradesh > Auraiya, Barabanki, Hamirpur (Up), Jalaun, Jhansi, Kanpur Dehat, Kanpur Nagar, Lalitpur, Lucknow, Mahoba, Unnao',
    'Uttar Pradesh > Baghpat, Bijnor, Meerut, Muzaffarnagar, Saharanpur, Shamli, Moradabad, Rampur',
    'Uttar Pradesh > Bahraich, Etawah, Farrukhabad, Hardoi, Kannauj, Kheri, Mainpuri, Sitapur',
    'Uttar Pradesh > Varanasi, Mirzapur, Jaunpur, Bhadohi, Ballia, Chandauli, Ghazipur, Mau, Sonbhadra',
    'Uttar Pradesh > Banda, Chitrakoot, Fatehpur, Kaushambi, Pratapgarh (Up), Prayagraj, Rae Bareli',
    'Uttarakhand > Almora, Pauri Garhwal',
    'Uttarakhand > Bageshwar, Pithoragarh',
    'Uttarakhand > Chamoli, Rudra Prayag',
    'Uttarakhand > Champawat, Nainital, Udam Singh Nagar',
    'Uttarakhand > Dehradun, Haridwar',
    'Uttarakhand > Tehri Garhwal, Uttar Kashi',
    'West Bengal > 24 Paraganas North, 24 Paraganas South, Howrah, Kolkata',
    'West Bengal > Alipurduar, Coochbehar, Darjeeling, Jalpaiguri, Kalimpong',
    'West Bengal > Bankura, Jhargram, Medinipur East, Medinipur West, Purulia',
    'West Bengal > Birbhum, Murshidabad',
    'West Bengal > Dinajpur Dakshin, Dinajpur Uttar, Maldah',
    'West Bengal > Hooghly, Nadia, Paschim Bardhaman, Purba Bardhaman'
];

const numbersToExcludeFromEmployeesCount: Array<String> = [
    // '+919970179564', // NA
    // '+918668521485', // NA
    '+918459714096', // Ramzan company
    '+918459714097', // Darshik Sir company
    '+918080528906', // Shubham company
    '+917767005472', // Daniel Sir company
    '+918080528901', // Swati Bhagat company
    '+918080528904', // Sweta Bodh company
    // '+918989508325', // S
    '+919579527419', // Surendra personal, Nagpur
    '+918080528883', // Praveen Sir company
    '+917410044869', // Ashish personal, Nagpur
    '+918799967346', // Amruta company
    '+918459714087', // Jaya company
    '+919370960294', // Surekha company
    '+919702003270', // Darshik personal, Nagpur
    '+919096794562', // Daniel personal, Nagpur
    '+918080896206', // Anjali personal, Nagpur
    '+919960710602', // Vivek personal, Nagpur
    '+919420856893', // Shubhangini personal, Nagpur
    '+919175965503', // Munesh personal, Nagpur
    '+919850203506', // Anita personal, Nagpur
    '+917507158855', // Praveenji second company
    '+917276423878', // Dolly personal, Nagpur
    '+918552952640', // Rasekar personal, Nagpur
    '+919766692497', // Amit Tiwari personal, Nagpur
    '+918750246146', // Vijay Kumar personal, Delhi
    '+918983331853', // Pranay personal, Nagpur
    '+918390528612', // Vivek personal, Nagpur
    '+918383048197', // Arjun personal, Delhi
    '+918329462852', // Amit Dixit personal, Nagpur
    '+919009247062', // Vipin Ramani personal, Indore
    '+917828446490', // Nidhi personal, Nagpur
    '+919198420644', // Rishik Mishra, Gujrat
    '+919373498967', // Zaid Gaush Sheikh, Pune
    '+919673156917', // Akash personal, Nagpur
    '+918080528863', // Deepak company
    '+918799951358', // Ram company
    '+918799967349', // Shilpa company
    '+918799951359', // Pooja company

    '+918799951361', // Unknown company
    '+918799951363', // Unknown company
    '+918799951364', // Unknown company
    '+919028167111', // Sayali company
    '+918799951365', // Megha company
    // Apr 01, 2022"
];

export const count_companies_increment_export = functions.region('asia-south1').runWith({ maxInstances: 2 }).firestore.document(`${companiesCollectionStringV2}/{trigId}`).onCreate(async (change, context) => {
    const db: FirebaseFirestore.Firestore = admin.firestore()
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const countsCollec = db.collection('counts')
    await countsCollec.doc('countsFromCloudFunction').update({ numberOfCompanies: admin.firestore.FieldValue.increment(1) });
    writesCounter++

    try {
        const afterData = change.data()

        let whatsapp: string = afterData.whatsapp
        let phoneOne: string = afterData.phoneOne
        let phoneTwo: string = afterData.phoneTwo
        let phoneThree: string = afterData.phoneThree
        let phoneFour: string = afterData.phoneFour

        let allPhones: Array<string> = []

        if (whatsapp != undefined && whatsapp != null && whatsapp != '') allPhones.push(whatsapp)
        if (phoneOne != undefined && phoneOne != null && phoneOne != '') allPhones.push(phoneOne)
        if (phoneTwo != undefined && phoneTwo != null && phoneTwo != '') allPhones.push(phoneTwo)
        if (phoneThree != undefined && phoneThree != null && phoneThree != '') allPhones.push(phoneThree)
        if (phoneFour != undefined && phoneFour != null && phoneFour != '') allPhones.push(phoneFour)

        allPhones = [...new Set(allPhones)]

        if (allPhones.length > 0) {
            for (const _phone of allPhones) {
                const empFromPhone = await db.collection(usersCollectionString).where('ownNumber', '==', _phone).get()
                readsCounter += empFromPhone.docs.length
                if (empFromPhone.docs.length > 1) {
                    await logError(`count_companies_increment///03///multiple users having number ${_phone}`)
                } else if (empFromPhone.docs.length == 1) {
                    try {
                        await empFromPhone.docs[0].ref.update({ companyIdArray: admin.firestore.FieldValue.arrayUnion(change.id) })
                        writesCounter++
                        await change.ref.update({ adminPhones: admin.firestore.FieldValue.arrayUnion(_phone) })
                        writesCounter++
                    } catch (e) {
                        if (e instanceof Error)
                            await logError(`count_companies_increment///04///${e.toString()}`)
                    }
                }
            }
        }
    } catch (e) {
        if (e instanceof Error)
            await logError(`count_companies_increment///02///${e.toString()}`)
    }

    await incrementReadWriteCounts('count_companies_increment', readsCounter, writesCounter, deletesCounter)
    return;
});

export const count_companies_decrement_export = functions.region('asia-south1').runWith({ maxInstances: 2 }).firestore.document(`${companiesCollectionStringV2}/{trigId}`).onDelete(async (change, context) => {
    const db: FirebaseFirestore.Firestore = admin.firestore()
    const countsCollec = db.collection('counts')
    await countsCollec.doc('countsFromCloudFunction').update({ numberOfCompanies: admin.firestore.FieldValue.increment(-1) });
});

export const c_notify_friends_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '2GB' }).firestore.document(`${companiesCollectionStringV2}/{cId}`).onCreate(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const db: FirebaseFirestore.Firestore = admin.firestore();
    const afterData = change.data()
    if (!afterData) { return; }
    const name = afterData.name
    if (name == null || name == undefined || name == '' || name.includes('test') || name.includes('Test') || name.includes('TEST')) return

    let displayName = name

    const actualCity = afterData.actualCity
    if (actualCity != null && actualCity != undefined && actualCity != '') displayName = `${displayName}, ${actualCity}`

    const phoneOne = afterData.phoneOne
    const phoneTwo = afterData.phoneTwo
    const phoneThree = afterData.phoneThree
    const whatsapp = afterData.whatsapp
    const employees = afterData.employees

    try {
        let companyPhones = []
        if (phoneOne != null && phoneOne != undefined && phoneOne != '') companyPhones.push(phoneOne)
        if (phoneTwo != null && phoneTwo != undefined && phoneTwo != '') companyPhones.push(phoneTwo)
        if (phoneThree != null && phoneThree != undefined && phoneThree != '') companyPhones.push(phoneThree)
        if (whatsapp != null && whatsapp != undefined && whatsapp != '') companyPhones.push(whatsapp)
        if (employees != null && employees != undefined) {
            for (const e of employees) {
                if (e != null && e != undefined && e != '' && companyPhones.length <= 9) companyPhones.push(whatsapp)
            }
        }

        companyPhones = [...new Set(companyPhones)]

        const usersQ = await db.collection(usersCollectionString).where('contactsArrayFresh', "array-contains-any", companyPhones).get();
        readsCounter += usersQ.docs.length

        let numbersString: string = ``
        for (const ph of companyPhones) {
            if (restrictedNumbersList.includes(ph)) {
                return;
            }
            if (numbersString == '') {
                numbersString = ph
            } else {
                numbersString += `, ${ph}`
            }
        }

        let tokens = []
        let userNumbers = []
        // let countWithToken: number = 0
        let countWithoutToken: number = 0

        for (const u of usersQ.docs) {
            const userData = u.data()
            const deviceInfo = userData.deviceInfo
            const ownNumber = userData.ownNumber

            if (deviceInfo == null || deviceInfo == undefined || deviceInfo == '' || ownNumber == null || ownNumber == undefined || ownNumber == '') {
                countWithoutToken++
            } else if (
                restrictedNumbersList.includes(ownNumber)
            ) {
                countWithoutToken++
            } else {
                userNumbers.push(ownNumber)
                const t = deviceInfo.token
                if (t != null && t != undefined && t != '') {
                    tokens.push(t)
                    // countWithToken++
                } else {
                    countWithoutToken++
                }
            }
        }

        // console.log(`companyCreated notification. Users knowing this company: ${usersQ.docs.length}; ownNumbers: ${userNumbers.length}`)

        tokens = [...new Set(tokens)]

        await db.collection('notifications').add({
            'title': `*${displayName}* (${numbersString}) joined Khoj App (free on iOS and Android)`,
            'body': `*${displayName}* (${numbersString}) खोज (Khoj app) में शामिल हुए हैं`,
            'tokens': tokens,
            'userNumbers': userNumbers,
            'status': 'pending',
            'createdAt': Date.now(),
            'createdAtForIndexing': Date.now(),
            'countTokens': tokens.length,
            'countWithoutTokens': countWithoutToken,
            'source': 'companyCreated',
            'destinationCompanyId': context.params.cId,
        })
        writesCounter++

        // if (tokens.length > 0) {
        //     console.log(`Found ${tokens.length} tokens for cId ${context.params.cId}; countWithoutToken: ${countWithoutToken}, countWithToken: ${countWithToken}; like ${tokens[0]}, ${tokens[1]}`)

        //     await db.collection('notifications').add({
        //         'title': `${displayName} (${numbersString}) joined Khoj App (free on iOS and Android)`,
        //         'body': '  ',
        //         'tokens': tokens,
        //         'userNumbers': userNumbers,
        //         'status': 'pending',
        //         'createdAt': Date.now(),
        //         'countTokens': tokens.length,
        //         'countWithoutTokens': countWithoutToken,
        //         'source': 'companyCreated'
        //     })
        // } else {
        //     console.log(`Found ${tokens.length} tokens for cId ${context.params.cId}; countWithoutToken: ${countWithoutToken}, countWithToken: ${countWithToken}`)


        // }

        try {
            /* // disabled informing non-Khoj members about their friends joining
            for (const n of companyPhones) {
                const cq = await db.collection(usersCollectionString).where('ownNumber', '==', n).get()
                readsCounter += cq.docs.length
                if (cq.docs.length == 1 && cq.docs[0] != null && cq.docs[0] != undefined && cq.docs[0].data() != undefined && cq.docs[0].data() != null && cq.docs[0].data().contactsArrayFresh != null && cq.docs[0].data().contactsArrayFresh != undefined) {

                    for (const cont of cq.docs[0].data().contactsArrayFresh) {
                        const mutualDoc = await db.collection('mutuals').doc(cont).get()
                        if (mutualDoc.exists &&
                            mutualDoc != undefined &&
                            mutualDoc.data() != undefined &&
                            mutualDoc.data() != null &&
                            mutualDoc.data()!.isUser != undefined &&
                            mutualDoc.data()!.isUser != null &&
                            mutualDoc.data()!.isUser == false) {
                            await db.collection('notifications').add({
                                'title': `${displayName} (${n}) joined Khoj. Khoj is a free app showing daily grain rates and news with a directory of 30,000+ registered members. Search for "Khoj" on the PlayStore/AppStore to download for free.`,
                                'body': '  ',
                                'tokens': [],
                                'userNumbers': [cont],
                                'status': 'pending',
                                'createdAt': Date.now(),
                                'createdAtForIndexing': Date.now(),
                                'countTokens': 0,
                                'countWithoutTokens': 0,
                                'source': 'companyCreatedMutual',
                                'destinationCompanyId': context.params.cId,
                            })
                            writesCounter++
                        }
                    }
                }
            }*/
        } catch (e) {
            if (e instanceof Error)
                await logError(`c_notify_friends///04///${e.toString()}`)

        }

        // String tokenJio =
        //     'ebrq85PTTQOppNI332wdG8:APA91bEbhNMovdUhSgoCmALFzvXoUa_Hz3VDGnHiQW_FTazrwcxrbZuveHIXXcvFIFbAvwp7hxLDpVH8SQwe7ASzDMbGwVSw2ydE0oN47WboysUpUejpNDCxzX5SMn1sns-VFrZwBl2V';
        // String tokenAirtel =
        //     'cp3kWl8UTuKfU6QNDV-_m4:APA91bE3h3zV5rwtpBrY0S0gK-9LNdwYRYaR6JIzgAxQgu5jOz7DT9L0hHhBZZX6Mca2YMEgzR14XPHYz1ikwjAaHnc8YWQtD1KZFO1UPknX7Ia6fJd2SzbpWsrc10CV4SgmauR3CdvY';
        // const trialTokens = [
        //     'ebrq85PTTQOppNI332wdG8:APA91bEbhNMovdUhSgoCmALFzvXoUa_Hz3VDGnHiQW_FTazrwcxrbZuveHIXXcvFIFbAvwp7hxLDpVH8SQwe7ASzDMbGwVSw2ydE0oN47WboysUpUejpNDCxzX5SMn1sns-VFrZwBl2V',
        //     'cp3kWl8UTuKfU6QNDV-_m4:APA91bE3h3zV5rwtpBrY0S0gK-9LNdwYRYaR6JIzgAxQgu5jOz7DT9L0hHhBZZX6Mca2YMEgzR14XPHYz1ikwjAaHnc8YWQtD1KZFO1UPknX7Ia6fJd2SzbpWsrc10CV4SgmauR3CdvY'
        // ]

    } catch (e) {
        if (e instanceof Error)
            await logError(`c_notify_friends///01///${e.toString()}`)
    }

    await incrementReadWriteCounts('c_notify_friends', readsCounter, writesCounter, deletesCounter)
    return
})

export const c_selfBasicsAndUpdateNetworkDocs_export = functions.region('asia-south1').runWith({ maxInstances: 100, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`${companiesCollectionStringV2}/{cId}`).onWrite(async (change, context) => {
    // need to make function to put city in actualCity field if it doesn't exist in the groups

    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    // await log_u2v3(`NOTER c_selfBasicsAndUpdateNetworkDocs 01 ${context.params.cId}`)
    await log_c(`start for cId ${context.params.cId}`)
    console.log(`started for cId ${context.params.cId}`)
    const db: FirebaseFirestore.Firestore = admin.firestore();

    try {
        let beforeName = ''
        let afterName = ''
        let beforeCity = ''
        let afterCity = ''
        let beforeCategory = ''
        let afterCategory = ''
        let beforeTestTrigger = '';
        let afterTestTrigger = '';

        if (change.before.exists && change.before.data() != null && change.before.data() != undefined) {
            if (change.before.data()!.name != null && change.before.data()!.name != undefined) beforeName = change.before.data()!.name

            if (change.before.data()!.actualCity != null && change.before.data()!.actualCity != undefined) beforeCity = change.before.data()!.actualCity

            if (change.before.data()!.category != null && change.before.data()!.category != undefined) beforeCategory = change.before.data()!.category

            if (change.before.data()!.testTrigger != null && change.before.data()!.testTrigger != undefined) beforeTestTrigger = change.before.data()!.testTrigger
        }

        if (change.after.exists && change.after.data() != null && change.after.data() != undefined) {
            if (change.after.data()!.name != null && change.after.data()!.name != undefined) afterName = change.after.data()!.name

            if (change.after.data()!.actualCity != null && change.after.data()!.actualCity != undefined) afterCity = change.after.data()!.actualCity

            if (change.after.data()!.category != null && change.after.data()!.category != undefined) afterCategory = change.after.data()!.category

            if (change.after.data()!.testTrigger != null && change.after.data()!.testTrigger != undefined) afterTestTrigger = change.after.data()!.testTrigger
        }

        console.log(`beforeName: ${beforeName}, afterName: ${afterName}`)

        if (beforeName == afterName && beforeCity == afterCity && beforeCategory == afterCategory && beforeTestTrigger == afterTestTrigger) {
            // do nothing 
        } else if (afterCategory != 'grain' && (beforeName != '' || beforeCity != '')) {
            try {
                const qCompanyNamesQuery = await db.collection('companyNames').where('companyNames', 'array-contains', `${beforeName}, ${beforeCity}`).get()
                readsCounter += qCompanyNamesQuery.docs.length
                for (const d of qCompanyNamesQuery.docs) {
                    await d.ref.update({ 'companyNames': admin.firestore.FieldValue.arrayRemove(`${beforeName}, ${beforeCity}`) })
                    console.log(`Removing ${beforeName}, ${beforeCity}`)
                    writesCounter++
                }
            } catch (e) { if (e instanceof Error) await logError(`c_self///67///${e.toString()}`) }
        } else {
            if (beforeName != '' || beforeCity != '')
                try {
                    const qCompanyNamesQuery = await db.collection('companyNames').where('companyNames', 'array-contains', `${beforeName}, ${beforeCity}`).get()
                    for (const d of qCompanyNamesQuery.docs) {
                        await d.ref.update({ 'companyNames': admin.firestore.FieldValue.arrayRemove(`${beforeName}, ${beforeCity}`) })
                        console.log(`Removing ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                } catch (e) { if (e instanceof Error) await logError(`c_self///63///${e.toString()}`) }

            if (afterName != '' || afterCity != '')
                try {
                    const formattedWithoutSpaces = getOnlyLettersLowerCase(afterName, true)

                    const twoLetters: string = formattedWithoutSpaces.substring(0, 2)
                    await db.collection('companyNames').doc(twoLetters).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                    writesCounter++

                    const formattedWithSpaces = getOnlyLettersLowerCase(afterName, false)

                    if (formattedWithSpaces.includes(' ') && formattedWithSpaces.split(' ').length > 1 && formattedWithSpaces.split(' ')[1].length >= 2) {
                        const twoLettersAgain: string = formattedWithSpaces.split(' ')[1].substring(0, 2)
                        await db.collection('companyNames').doc(twoLettersAgain).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                        console.log(`Adding ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                    if (formattedWithSpaces.includes(' ') && formattedWithSpaces.split(' ').length > 2 && formattedWithSpaces.split(' ')[2].length >= 2) {
                        const twoLettersAgain: string = formattedWithSpaces.split(' ')[2].substring(0, 2)
                        await db.collection('companyNames').doc(twoLettersAgain).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                        console.log(`Adding ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                    if (formattedWithSpaces.includes(' ') && formattedWithSpaces.split(' ').length > 3 && formattedWithSpaces.split(' ')[3].length >= 2) {
                        const twoLettersAgain: string = formattedWithSpaces.split(' ')[3].substring(0, 2)
                        await db.collection('companyNames').doc(twoLettersAgain).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                        console.log(`Adding ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                } catch (e) { if (e instanceof Error) await logError(`c_self///62///${e.toString()}`) }
        }

        if (beforeName == afterName && beforeCity == afterCity && beforeCategory == afterCategory && beforeTestTrigger == afterTestTrigger) {
            console.log(`For transporter 00`)
            // do nothing 
        } else if (afterCategory != 'transporter' && (beforeName != '' || beforeCity != '')) {
            console.log(`For transporter 01`)
            try {
                const qCompanyNamesQuery = await db.collection('transporterNames').where('companyNames', 'array-contains', `${beforeName}, ${beforeCity}`).get()
                readsCounter += qCompanyNamesQuery.docs.length
                for (const d of qCompanyNamesQuery.docs) {
                    await d.ref.update({ 'companyNames': admin.firestore.FieldValue.arrayRemove(`${beforeName}, ${beforeCity}`) })
                    console.log(`Removing from transporter ${d.id} ${beforeName}, ${beforeCity}`)
                    writesCounter++
                }
            } catch (e) { if (e instanceof Error) await logError(`c_self///67///${e.toString()}`) }
        } else {
            console.log(`For transporter 02`)
            if (beforeName != '' || beforeCity != '')
                try {
                    const qCompanyNamesQuery = await db.collection('transporterNames').where('companyNames', 'array-contains', `${beforeName}, ${beforeCity}`).get()
                    for (const d of qCompanyNamesQuery.docs) {
                        await d.ref.update({ 'companyNames': admin.firestore.FieldValue.arrayRemove(`${beforeName}, ${beforeCity}`) })
                        console.log(`Removing from transporter ${d.id} ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                } catch (e) { if (e instanceof Error) await logError(`c_self///63///${e.toString()}`) }

            if (afterName != '' || afterCity != '')
                try {
                    const formattedWithoutSpaces = getOnlyLettersLowerCase(afterName, true)

                    const twoLetters: string = formattedWithoutSpaces.substring(0, 2)
                    await db.collection('transporterNames').doc(twoLetters).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                    console.log(`Adding for transporter1 ${twoLetters} ${beforeName}, ${beforeCity}`)
                    writesCounter++

                    const formattedWithSpaces = getOnlyLettersLowerCase(afterName, false)

                    if (formattedWithSpaces.includes(' ') && formattedWithSpaces.split(' ').length > 1 && formattedWithSpaces.split(' ')[1].length >= 2) {
                        const twoLettersAgain: string = formattedWithSpaces.split(' ')[1].substring(0, 2)
                        await db.collection('transporterNames').doc(twoLettersAgain).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                        console.log(`Adding for transporter2 ${twoLettersAgain} ${beforeName}, ${beforeCity}`)
                        console.log(`Adding for transporter3 ${twoLettersAgain} ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                    if (formattedWithSpaces.includes(' ') && formattedWithSpaces.split(' ').length > 2 && formattedWithSpaces.split(' ')[2].length >= 2) {
                        const twoLettersAgain: string = formattedWithSpaces.split(' ')[2].substring(0, 2)
                        await db.collection('transporterNames').doc(twoLettersAgain).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                        console.log(`Adding for transporter4 ${twoLettersAgain} ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                    if (formattedWithSpaces.includes(' ') && formattedWithSpaces.split(' ').length > 3 && formattedWithSpaces.split(' ')[3].length >= 2) {
                        const twoLettersAgain: string = formattedWithSpaces.split(' ')[3].substring(0, 2)
                        await db.collection('transporterNames').doc(twoLettersAgain).update({ 'companyNames': admin.firestore.FieldValue.arrayUnion(`${afterName}, ${afterCity}`) })
                        console.log(`Adding for transporter5 ${twoLettersAgain} ${beforeName}, ${beforeCity}`)
                        writesCounter++
                    }

                } catch (e) { if (e instanceof Error) await logError(`c_self///62///${e.toString()}`) }
        }
    } catch (e) {
        if (e instanceof Error)
            await logError(`c_self///61///${e.toString()}`)
        if (e instanceof Error)
            console.log(`c_self///61///${e.toString()}`)
    }

    if (!change.after.exists) { return; }

    const afterData = change.after.data()
    if (!afterData) { await log_c(`END c02 for cId ${context.params.cId}`); return; }

    try {
        let newNameArray: string[] = []
        let categorySpecificKeywords: string[] = []

        if (afterData.category == 'warehouse') {
            if (afterData.warehouseType != undefined && afterData.warehouseType != null && afterData.warehouseType != '')
                categorySpecificKeywords.push(afterData.warehouseType)
            newNameArray = await getNameArray(afterData.name || '', afterData.keywords || [], afterData.products || [], afterData.productsV2 || [], afterData.category || '', categorySpecificKeywords || [], afterData.country, afterData.iecVerified || false)

        } else if (afterData.category == 'bag') {
            if (afterData.bagPp == true) categorySpecificKeywords.push('pp')
            if (afterData.bagBopp == true) categorySpecificKeywords.push('bopp')
            if (afterData.bagJute == true) categorySpecificKeywords.push('jute')
            if (afterData.bagPaper == true) categorySpecificKeywords.push('paper')
            if (afterData.bagJumbo == true) categorySpecificKeywords.push('jumbo')
            if (afterData.bagNonWoven == true) categorySpecificKeywords.push('nonwoven')
            if (afterData.bagLiner == true) categorySpecificKeywords.push('liner')
            if (afterData.bagFlexible == true) categorySpecificKeywords.push('flexible')
            newNameArray = await getNameArray(afterData.name || '', afterData.keywords || [], afterData.products || [], afterData.productsV2 || [], afterData.category || '', categorySpecificKeywords || [], afterData.country, afterData.iecVerified || false)

        } else if (afterData.category == 'transporter') {
            if (afterData.districtState != null && afterData.districtState != undefined) categorySpecificKeywords.push(afterData.districtState)
            newNameArray = await getNameArray(afterData.name || '', afterData.keywords || [], afterData.products || [], afterData.productsV2 || [], afterData.category || '', categorySpecificKeywords || [], afterData.country, afterData.iecVerified || false)

        } else {

            newNameArray = await getNameArray(afterData.name || '', afterData.keywords || [], afterData.products || [], afterData.productsV2 || [], afterData.category || '', categorySpecificKeywords || [], afterData.country, afterData.iecVerified || false)
        }

        try {
            const companyCountry = afterData.country
            const path = `countriesForInternational.${companyCountry}.ignore`

            if (
                afterData.country == 'India' && afterData.iecVerified == true ||
                (companyCountry != undefined && companyCountry != null && !companyCountry.includes('india') && !companyCountry.includes('India'))
            ) {
                await db.collection('display').doc('countriesForInternational').update({
                    [path]: admin.firestore.FieldValue.increment(1)
                })
            }
        } catch (e) {
            if (e instanceof Error)
                await logError(`c_self///81///${e.toString()}`)
            if (e instanceof Error)
                await log_c(`ERR c081: ${e.toString()}`)
        }

        let employeesWithoutField: Array<String> = [];
        let countOfEmployeesWithoutField: number = 0;
        let employeeNamesMap: Map<string, string> = new Map()
        let employeeNamesMapForUploading;

        try {
            const employees: Array<String> = afterData.employees || [];
            for (const emp of employees) {
                if (!numbersToExcludeFromEmployeesCount.includes(emp)) {
                    employeesWithoutField.push(emp)
                }
            }
            countOfEmployeesWithoutField = employeesWithoutField.length;
        } catch (error) {
            if (error instanceof Error) await logError(`c_self///01///${error.toString()}`)
            if (error instanceof Error) await log_c(`ERR 035: ${error.toString()}`)
        }

        try {
            const employeeNumbersFromDb: Array<string> = afterData.employees;
            if (employeeNumbersFromDb != null && employeeNumbersFromDb != undefined) {
                for (const employeeNumber of employeeNumbersFromDb) {
                    const empQuery = await db.collection(usersCollectionString).where('ownNumber', '==', employeeNumber).get()
                    if (empQuery.docs.length == 1) {
                        try {
                            const empName = empQuery.docs[0].get('name')
                            if (empName != null && empName != '') {
                                employeeNamesMap.set(employeeNumber, empName)
                            }
                        } catch (e) {
                            if (e instanceof Error)
                                await logError(`c_self///02///${e.toString()}`)
                            if (e instanceof Error)
                                await log_c(`ERR c033: ${e.toString()}`)
                        }
                    } else if (empQuery.docs.length > 1) {
                        await logError(`c_self///03///more than one user with ownNumber ${employeeNumber}: ${empQuery.docs[0].id}, ${empQuery.docs[1].id}`)
                        await log_c(`ERR c036.1 more than one user with ownNumber ${employeeNumber}: ${empQuery.docs[0].id}, ${empQuery.docs[1].id}`)
                    } else if (empQuery.docs.length == 0) {
                        await logError(`c_self///04///not found with ownNumber ${employeeNumber}`)
                        await log_c(`ERR c036.2 not found with ownNumber ${employeeNumber}`)
                    } else {
                        await logError(`c_self///05///should not reach here; ownNumber: ${employeeNumber}`)
                        await log_c(`ERR c036.3 should not reach here; ownNumber: ${employeeNumber}`)
                    }
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                await logError(`c_self///06///${e.toString()}`)
                await log_c(`ERR c0341: ${e.toString()}`)
            }
        }

        employeeNamesMapForUploading = Array.from(employeeNamesMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

        const verifiedLow: boolean = afterData.verifiedLow
        const verifiedMedium: boolean = afterData.verifiedMedium
        const verifiedHigh: boolean = afterData.verifiedHigh

        let verifiedBool: boolean = false;

        try {
            if ((verifiedLow != undefined && verifiedLow != null && verifiedLow)
                || (verifiedMedium != undefined && verifiedMedium != null && verifiedMedium)
                || (verifiedHigh != undefined && verifiedHigh != null && verifiedHigh)) {
                verifiedBool = true;
            }
        } catch (e) {
            if (e instanceof Error) {
                await logError(`c_self///07///${e.toString()}`)
                await log_c(`ERR c04b: ${e.toString()}`)
            }
        }

        let category: string = afterData.category ?? 'grain'
        if (category == '' || category == undefined || category == null) category = 'grain'

        let companyPoints: number = 0

        // if (category == 'warehouse') points         = -5000000
        // if (category == 'transporter') points       = -10000000
        // if (category == 'bag') points               = -20000000
        // if (category == 'farmer') points            = -30000000
        // if (category == 'machine') points           = -40000000

        if (category == 'warehouse') companyPoints = -5000000
        if (category == 'transporter') companyPoints = -10000000
        if (category == 'bag') companyPoints = -20000000
        if (category == 'farmer') companyPoints = -30000000
        if (category == 'machine') companyPoints = -40000000
        if (category == 'surveyor') companyPoints = -50000000
        if (category == 'software') companyPoints = -60000000
        if (category == 'cha') companyPoints = -70000000
        if (category == 'forwarder') companyPoints = -80000000

        const sponsoredBronze: boolean = afterData.sponsoredBronze
        const sponsoredSilver: boolean = afterData.sponsoredSilver
        const sponsoredGold: boolean = afterData.sponsoredGold
        const sponsoredDiamond: boolean = afterData.sponsoredDiamond
        const shortDescription: String = afterData.shortDescription

        // short description points
        if (shortDescription != undefined && shortDescription != null && shortDescription.length > 5)
            companyPoints += pointsShortDescription

        // sponsorship points
        if (sponsoredDiamond == true) companyPoints += pointsSponsoredDiamond
        if (sponsoredGold == true) companyPoints += pointsSponsoredGold
        if (sponsoredSilver == true) companyPoints += pointsSponsoredSilver
        if (sponsoredBronze == true) companyPoints += pointsSponsoredBronze

        // verification points
        if (verifiedHigh == true) companyPoints += pointsVerifiedHigh
        if (verifiedMedium == true) companyPoints += pointsVerifiedMedium
        if (verifiedLow == true) companyPoints += pointsVerifiedLow

        let city: string = afterData.city
        let actualCity: string = afterData.actualCity
        let state: string = afterData.state
        const pinCode: string = afterData.pinCode

        if (city == null || city == undefined) { city = '' }
        if (state == null || state == undefined) { state = '' }

        if (pinCode != null && pinCode != undefined && pinCode.length == 6) {
            if ((!groupsGlobal.includes(city) || city == '') || (!city.includes(state) || state == '')) {

                if (actualCity == null || actualCity == undefined || actualCity == '')
                    actualCity = city

                const groupFromDb: string = await getGroupFromDbUsingPin(pinCode)
                if (groupFromDb != null && groupFromDb != undefined && groupFromDb != '') {
                    city = groupFromDb

                    try {
                        if (groupFromDb.includes(' > ')) {
                            const splitted: string[] = groupFromDb.split(' > ', 1)
                            state = splitted[0]
                        } else {
                            await logError(`c_self///40e///NOTERR grp does not have " > ": ${groupFromDb}`)
                        }
                    } catch (e) {
                        if (e instanceof Error)
                            await logError(`c_self///40d///${context.params.cId} - state not found for ${groupFromDb}`)
                        state = ''
                    }
                } else {
                    try {
                        await db.collection('zLogs').doc('groupsMissingFor').update({ groupsMissingFor: admin.firestore.FieldValue.arrayUnion(pinCode) });
                        writesCounter++
                    } catch (e) {
                        if (e instanceof Error)
                            await logError(`c_self///41b///${context.params.cId} - group not found for ${pinCode}; ERROR: ${e.toString()}`)
                    }
                }
            } else {
                // await logError(`c_self///40e///NOTERR city: ${city}`)
            }
        }

        if (state == undefined || state == null) {
            state = ''
        }

        if (actualCity == undefined || actualCity == null) {
            actualCity = ''
        }

        if (city == undefined || city == null) {
            city = ''
        }

        if (!change.before.exists) {
            await change.after.ref.update({
                createdAt: Date.now(),
                nameArray: newNameArray,
                countOfEmployeesWithoutField: countOfEmployeesWithoutField,
                verified: verifiedBool,
                companyPoints: companyPoints,

                // non fieldvalue update
                employeeNamesMap: employeeNamesMapForUploading,

                // new
                city: city,
                actualCity: actualCity,
                state: state,

                category: category,
            })
            writesCounter++
            return
        } else {
            await change.after.ref.update({
                nameArray: newNameArray,
                countOfEmployeesWithoutField: countOfEmployeesWithoutField,
                verified: verifiedBool,
                companyPoints: companyPoints,

                // non fieldvalue update
                employeeNamesMap: employeeNamesMapForUploading,

                // new
                city: city,
                actualCity: actualCity,
                state: state,

                category: category,
            })
            writesCounter++
        }

        const companyDocDataMap: Map<string, any> = new Map(Object.entries(afterData))

        // delete these as these should not be copied from a company to its child network doc
        companyDocDataMap.delete('directLinks')
        companyDocDataMap.delete('networkLinks')
        companyDocDataMap.delete('networkKeys')
        companyDocDataMap.delete('networkValues')
        companyDocDataMap.delete('points')
        companyDocDataMap.delete('companyPoints')
        companyDocDataMap.delete('productsV2')
        companyDocDataMap.delete('countOfEmployeesWithoutField')
        companyDocDataMap.delete('createdAt')
        companyDocDataMap.delete('adminRemarks')
        companyDocDataMap.delete('testTrigger')
        // if (companyDocDataMap.get('description') == '' || companyDocDataMap.get('description') == null) companyDocDataMap.delete('description')
        // if (companyDocDataMap.get('email') == '' || companyDocDataMap.get('email') == null) companyDocDataMap.delete('email')
        // if (companyDocDataMap.get('gst') == '' || companyDocDataMap.get('gst') == null) companyDocDataMap.delete('gst')
        // if (companyDocDataMap.get('iec') == '' || companyDocDataMap.get('iec') == null) companyDocDataMap.delete('iec')
        // if (companyDocDataMap.get('linkOne') == '' || companyDocDataMap.get('linkOne') == null) companyDocDataMap.delete('linkOne')
        // if (companyDocDataMap.get('linkTwo') == '' || companyDocDataMap.get('linkTwo') == null) companyDocDataMap.delete('linkTwo')
        // if (companyDocDataMap.get('logoUrl') == '' || companyDocDataMap.get('logoUrl') == null) companyDocDataMap.delete('logoUrl')

        for (const checkVariable of ['logoUrl', 'phoneTwo', 'phoneThree', 'linkOne', 'linkTwo', 'gst', 'iec', 'email', 'description']) {
            if (companyDocDataMap.get(checkVariable) == '' || companyDocDataMap.get(checkVariable) == null || companyDocDataMap.get(checkVariable) == undefined) companyDocDataMap.delete(checkVariable)
        }

        companyDocDataMap.set('selfUpdatesPending', true) // TODO probably not needed but kept it to be extra safe; i think needed for updating verified badge points
        companyDocDataMap.set('selfUpdatesFromCompany', true)

        let companyDocDataMapObject = Array.from(companyDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
        companyDocDataMap.delete('city')
        if (companyDocDataMap.get('actualCity') != null && companyDocDataMap.get('actualCity') != undefined && companyDocDataMap.get('actualCity') != '') {
            companyDocDataMap.set('city', companyDocDataMap.get('actualCity'))
        }

        const networkQuery = await db.collection(companiesCollectionStringV2).doc(context.params.cId).collection('network').get()
        readsCounter += networkQuery.docs.length
        await incrementReadWriteNSelfV2('a1', networkQuery.docs.length, undefined)
        for (const docInNetwork of networkQuery.docs) {
            try {
                // non fieldvalue update
                await docInNetwork.ref.update(companyDocDataMapObject)
                writesCounter++
            } catch (e) {
                if (e instanceof Error)
                    if (e.toString().includes('No document to update')) {
                        // do nothing
                    } else {
                        try {
                            await logError(`c_self///09///${docInNetwork.ref.parent.parent!.id} > ${docInNetwork.id} ${e.toString()}`)
                            await log_c(`ERR c04 03.12.2021.: ${docInNetwork.ref.parent.parent!.id} > ${docInNetwork.id} ${e.toString()}`)

                        } catch (error) {
                            if (error instanceof Error) await logError(`c_self///10///${docInNetwork.id} ${e.toString()}`)
                            if (error instanceof Error) await log_c(`ERR c04 03.12.2021.: ${docInNetwork.id} ${e.toString()}`)
                        }
                    }
            }
        }
        companyDocDataMap.delete('address')
        companyDocDataMap.delete('countOfEmployeesWithoutField')
        companyDocDataMap.delete('country')
        companyDocDataMap.delete('createdAt')
        companyDocDataMap.delete('description')
        companyDocDataMap.delete('directLinks')
        companyDocDataMap.delete('directLinks')
        companyDocDataMap.delete('fieldPhones')
        companyDocDataMap.delete('googleSheetPerson')
        companyDocDataMap.delete('googleSheetUrl')
        companyDocDataMap.delete('gst')
        companyDocDataMap.delete('id')
        companyDocDataMap.delete('info')
        companyDocDataMap.delete('lbt')
        companyDocDataMap.delete('linkOne')
        companyDocDataMap.delete('linkThree')
        companyDocDataMap.delete('linkTwo')
        companyDocDataMap.delete('logoUrl')
        companyDocDataMap.delete('nameArray')
        companyDocDataMap.delete('productsV2')
        companyDocDataMap.delete('networkLinks')
        companyDocDataMap.delete('pinCode')
        companyDocDataMap.delete('revenue')
        companyDocDataMap.delete('source')
        companyDocDataMap.delete('vat')
        companyDocDataMap.delete('city')

        companyDocDataMap.delete('companyPoints')
        // companyDocDataMap.delete('transporterCompanyPoints')
        companyDocDataMap.delete('employeeNamesMap')
        companyDocDataMap.delete('networkKeys')
        companyDocDataMap.delete('networkValues')
        companyDocDataMap.delete('products')
        companyDocDataMap.delete('sponsoredBronze')
        companyDocDataMap.delete('sponsoredSilver')
        companyDocDataMap.delete('sponsoredGold')
        companyDocDataMap.delete('sponsoredDiamond')
        companyDocDataMap.delete('sr')
        companyDocDataMap.delete('shortDescription')
        companyDocDataMap.delete('verified')
        companyDocDataMap.delete('verifiedLow')
        companyDocDataMap.delete('verifiedMedium')
        companyDocDataMap.delete('verifiedHigh')
        companyDocDataMap.delete('employees')
        companyDocDataMap.delete('adminPhones')
        companyDocDataMap.delete('email')
        companyDocDataMap.delete('iec')
        companyDocDataMap.delete('keywords')
        companyDocDataMap.delete('adminRemarks')
        companyDocDataMap.delete('pan')
        companyDocDataMap.delete('cityArray')
        companyDocDataMap.delete('phoneThree')
        companyDocDataMap.delete('phoneTwo')

        if (companyDocDataMap.get('actualCity') != null && companyDocDataMap.get('actualCity') != undefined && companyDocDataMap.get('actualCity') != '') {
            companyDocDataMap.set('city', companyDocDataMap.get('actualCity'))
        }

        let companyDocDataMapObjectForPosts = Array.from(companyDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

        const postsQuery = await db.collection(companiesCollectionStringV2).doc(context.params.cId).collection(postsCollectionString).get()
        readsCounter += postsQuery.docs.length
        for (const docInPosts of postsQuery.docs) {
            try {
                // non fieldvalue update
                await docInPosts.ref.update(companyDocDataMapObjectForPosts)
                writesCounter++
            } catch (e) {
                if (e instanceof Error)
                    await logError(`c_self///11///${e.toString()}`)
                if (e instanceof Error)
                    await log_c(`ERR c042: ${e.toString()}`)
            }
        }


        await log_c(`END 03 for cId ${context.params.cId}`)
        await incrementReadWriteCounts('c_selfBasicsAndUpdateNetworkDocs', readsCounter, writesCounter, deletesCounter)

        return
    } catch (e) {
        if (e instanceof Error)
            await logError(`c_self///12///${e.toString()}`)
        if (e instanceof Error)
            await log_c(`ERR 05: ${e.toString()}`)
        return
    }
    return
});
