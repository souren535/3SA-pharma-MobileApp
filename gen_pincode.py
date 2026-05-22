import json

data = {
  "country": "India",
  "note": "Representative pincode dataset covering all states and UTs of India",
  "data": {
    "Andhra Pradesh": {
      "districts": {
        "Visakhapatnam": {"pincodes": [
          {"pincode":"530001","area":"Visakhapatnam HO","block":"Visakhapatnam"},
          {"pincode":"530002","area":"Daba Gardens","block":"Visakhapatnam"},
          {"pincode":"530016","area":"Gajuwaka","block":"Visakhapatnam"},
          {"pincode":"531001","area":"Bheemunipatnam","block":"Bheemunipatnam"},
          {"pincode":"531002","area":"Anakapalle","block":"Anakapalle"}
        ]},
        "Krishna": {"pincodes": [
          {"pincode":"520001","area":"Vijayawada HO","block":"Vijayawada"},
          {"pincode":"520002","area":"Governorpet","block":"Vijayawada"},
          {"pincode":"521001","area":"Machilipatnam HO","block":"Machilipatnam"},
          {"pincode":"521002","area":"Gudivada","block":"Gudivada"}
        ]},
        "Guntur": {"pincodes": [
          {"pincode":"522001","area":"Guntur HO","block":"Guntur"},
          {"pincode":"522002","area":"Brodipet","block":"Guntur"},
          {"pincode":"523001","area":"Ongole HO","block":"Ongole"},
          {"pincode":"522201","area":"Tenali","block":"Tenali"}
        ]},
        "Kurnool": {"pincodes": [
          {"pincode":"518001","area":"Kurnool HO","block":"Kurnool"},
          {"pincode":"518002","area":"Kurnool Town","block":"Kurnool"},
          {"pincode":"518301","area":"Adoni","block":"Adoni"}
        ]},
        "Chittoor": {"pincodes": [
          {"pincode":"517001","area":"Chittoor HO","block":"Chittoor"},
          {"pincode":"517501","area":"Tirupati HO","block":"Tirupati"},
          {"pincode":"517502","area":"Tirupati East","block":"Tirupati"}
        ]},
        "East Godavari": {"pincodes": [
          {"pincode":"533001","area":"Rajahmundry HO","block":"Rajahmundry"},
          {"pincode":"533101","area":"Kakinada HO","block":"Kakinada"}
        ]},
        "West Godavari": {"pincodes": [
          {"pincode":"534001","area":"Eluru HO","block":"Eluru"},
          {"pincode":"534101","area":"Bhimavaram HO","block":"Bhimavaram"}
        ]}
      }
    },
    "Arunachal Pradesh": {
      "districts": {
        "Itanagar Capital Complex": {"pincodes": [
          {"pincode":"791111","area":"Itanagar HO","block":"Itanagar"},
          {"pincode":"791001","area":"Naharlagun","block":"Naharlagun"}
        ]},
        "Tawang": {"pincodes": [
          {"pincode":"790104","area":"Tawang HO","block":"Tawang"}
        ]},
        "East Siang": {"pincodes": [
          {"pincode":"791001","area":"Pasighat HO","block":"Pasighat"}
        ]}
      }
    },
    "Assam": {
      "districts": {
        "Kamrup Metropolitan": {"pincodes": [
          {"pincode":"781001","area":"Guwahati HO","block":"Guwahati"},
          {"pincode":"781003","area":"Pan Bazar","block":"Guwahati"},
          {"pincode":"781005","area":"Dispur","block":"Guwahati"},
          {"pincode":"781006","area":"Maligaon","block":"Guwahati"}
        ]},
        "Dibrugarh": {"pincodes": [
          {"pincode":"786001","area":"Dibrugarh HO","block":"Dibrugarh"},
          {"pincode":"786002","area":"Dibrugarh Town","block":"Dibrugarh"}
        ]},
        "Jorhat": {"pincodes": [
          {"pincode":"785001","area":"Jorhat HO","block":"Jorhat"}
        ]},
        "Silchar": {"pincodes": [
          {"pincode":"788001","area":"Silchar HO","block":"Silchar"},
          {"pincode":"788002","area":"Silchar Town","block":"Silchar"}
        ]},
        "Nagaon": {"pincodes": [
          {"pincode":"782001","area":"Nagaon HO","block":"Nagaon"}
        ]},
        "Tezpur": {"pincodes": [
          {"pincode":"784001","area":"Tezpur HO","block":"Tezpur"}
        ]}
      }
    },
    "Bihar": {
      "districts": {
        "Patna": {"pincodes": [
          {"pincode":"800001","area":"Patna GPO","block":"Patna"},
          {"pincode":"800002","area":"Patna City","block":"Patna"},
          {"pincode":"800003","area":"Bankipur","block":"Patna"},
          {"pincode":"800004","area":"Rajendra Nagar","block":"Patna"},
          {"pincode":"800013","area":"Danapur","block":"Danapur"}
        ]},
        "Gaya": {"pincodes": [
          {"pincode":"823001","area":"Gaya HO","block":"Gaya"},
          {"pincode":"824101","area":"Aurangabad","block":"Aurangabad"}
        ]},
        "Muzaffarpur": {"pincodes": [
          {"pincode":"842001","area":"Muzaffarpur HO","block":"Muzaffarpur"},
          {"pincode":"842002","area":"Muzaffarpur Town","block":"Muzaffarpur"}
        ]},
        "Bhagalpur": {"pincodes": [
          {"pincode":"812001","area":"Bhagalpur HO","block":"Bhagalpur"}
        ]},
        "Darbhanga": {"pincodes": [
          {"pincode":"846001","area":"Darbhanga HO","block":"Darbhanga"}
        ]},
        "Purnia": {"pincodes": [
          {"pincode":"854301","area":"Purnea HO","block":"Purnea"}
        ]},
        "Begusarai": {"pincodes": [
          {"pincode":"851101","area":"Begusarai HO","block":"Begusarai"}
        ]}
      }
    },
    "Chhattisgarh": {
      "districts": {
        "Raipur": {"pincodes": [
          {"pincode":"492001","area":"Raipur HO","block":"Raipur"},
          {"pincode":"492002","area":"Raipur City","block":"Raipur"},
          {"pincode":"492006","area":"Shankar Nagar","block":"Raipur"}
        ]},
        "Bhilai Nagar": {"pincodes": [
          {"pincode":"490001","area":"Bhilai HO","block":"Bhilai"},
          {"pincode":"490006","area":"Bhilai-3","block":"Bhilai"}
        ]},
        "Bilaspur": {"pincodes": [
          {"pincode":"495001","area":"Bilaspur HO","block":"Bilaspur"},
          {"pincode":"495002","area":"Bilaspur City","block":"Bilaspur"}
        ]},
        "Jagdalpur": {"pincodes": [
          {"pincode":"494001","area":"Jagdalpur HO","block":"Jagdalpur"}
        ]},
        "Ambikapur": {"pincodes": [
          {"pincode":"497001","area":"Ambikapur HO","block":"Ambikapur"}
        ]}
      }
    },
    "Goa": {
      "districts": {
        "North Goa": {"pincodes": [
          {"pincode":"403001","area":"Panaji HO","block":"Panaji"},
          {"pincode":"403002","area":"Panaji City","block":"Panaji"},
          {"pincode":"403101","area":"Mapusa HO","block":"Mapusa"},
          {"pincode":"403201","area":"Calangute","block":"Bardez"},
          {"pincode":"403501","area":"Pernem","block":"Pernem"}
        ]},
        "South Goa": {"pincodes": [
          {"pincode":"403601","area":"Margao HO","block":"Margao"},
          {"pincode":"403602","area":"Margao City","block":"Margao"},
          {"pincode":"403401","area":"Ponda HO","block":"Ponda"},
          {"pincode":"403702","area":"Canacona","block":"Canacona"}
        ]}
      }
    },
    "Gujarat": {
      "districts": {
        "Ahmedabad": {"pincodes": [
          {"pincode":"380001","area":"Ahmedabad GPO","block":"Ahmedabad"},
          {"pincode":"380002","area":"Bhadra","block":"Ahmedabad"},
          {"pincode":"380009","area":"Naranpura","block":"Ahmedabad"},
          {"pincode":"382010","area":"Gandhinagar HO","block":"Gandhinagar"},
          {"pincode":"380058","area":"Satellite","block":"Ahmedabad"}
        ]},
        "Surat": {"pincodes": [
          {"pincode":"395001","area":"Surat HO","block":"Surat"},
          {"pincode":"395002","area":"Surat City","block":"Surat"},
          {"pincode":"395007","area":"Adajan","block":"Surat"}
        ]},
        "Vadodara": {"pincodes": [
          {"pincode":"390001","area":"Vadodara HO","block":"Vadodara"},
          {"pincode":"390002","area":"Raopura","block":"Vadodara"},
          {"pincode":"390007","area":"Alkapuri","block":"Vadodara"}
        ]},
        "Rajkot": {"pincodes": [
          {"pincode":"360001","area":"Rajkot HO","block":"Rajkot"},
          {"pincode":"360002","area":"Rajkot City","block":"Rajkot"}
        ]},
        "Bhavnagar": {"pincodes": [
          {"pincode":"364001","area":"Bhavnagar HO","block":"Bhavnagar"}
        ]},
        "Kutch": {"pincodes": [
          {"pincode":"370001","area":"Bhuj HO","block":"Bhuj"},
          {"pincode":"370201","area":"Gandhidham HO","block":"Gandhidham"}
        ]},
        "Anand": {"pincodes": [
          {"pincode":"388001","area":"Anand HO","block":"Anand"}
        ]},
        "Mehsana": {"pincodes": [
          {"pincode":"384001","area":"Mehsana HO","block":"Mehsana"}
        ]}
      }
    },
    "Haryana": {
      "districts": {
        "Gurugram": {"pincodes": [
          {"pincode":"122001","area":"Gurugram HO","block":"Gurugram"},
          {"pincode":"122002","area":"DLF Phase 1","block":"Gurugram"},
          {"pincode":"122016","area":"Sohna","block":"Sohna"}
        ]},
        "Faridabad": {"pincodes": [
          {"pincode":"121001","area":"Faridabad HO","block":"Faridabad"},
          {"pincode":"121002","area":"NIT Faridabad","block":"Faridabad"}
        ]},
        "Ambala": {"pincodes": [
          {"pincode":"134001","area":"Ambala City","block":"Ambala"},
          {"pincode":"133001","area":"Ambala Cantonment","block":"Ambala"}
        ]},
        "Hisar": {"pincodes": [
          {"pincode":"125001","area":"Hisar HO","block":"Hisar"},
          {"pincode":"125002","area":"Hisar City","block":"Hisar"}
        ]},
        "Rohtak": {"pincodes": [
          {"pincode":"124001","area":"Rohtak HO","block":"Rohtak"}
        ]},
        "Panipat": {"pincodes": [
          {"pincode":"132001","area":"Panipat HO","block":"Panipat"}
        ]},
        "Karnal": {"pincodes": [
          {"pincode":"132001","area":"Karnal HO","block":"Karnal"}
        ]},
        "Sonipat": {"pincodes": [
          {"pincode":"131001","area":"Sonipat HO","block":"Sonipat"}
        ]}
      }
    },
    "Himachal Pradesh": {
      "districts": {
        "Shimla": {"pincodes": [
          {"pincode":"171001","area":"Shimla HO","block":"Shimla"},
          {"pincode":"171002","area":"Shimla Town","block":"Shimla"},
          {"pincode":"171003","area":"Boileauganj","block":"Shimla"}
        ]},
        "Kangra": {"pincodes": [
          {"pincode":"176001","area":"Dharamsala HO","block":"Dharamsala"},
          {"pincode":"176215","area":"Palampur","block":"Palampur"}
        ]},
        "Mandi": {"pincodes": [
          {"pincode":"175001","area":"Mandi HO","block":"Mandi"}
        ]},
        "Kullu": {"pincodes": [
          {"pincode":"175101","area":"Kullu HO","block":"Kullu"}
        ]},
        "Solan": {"pincodes": [
          {"pincode":"173001","area":"Solan HO","block":"Solan"},
          {"pincode":"174101","area":"Baddi","block":"Baddi"}
        ]}
      }
    },
    "Jharkhand": {
      "districts": {
        "Ranchi": {"pincodes": [
          {"pincode":"834001","area":"Ranchi HO","block":"Ranchi"},
          {"pincode":"834002","area":"Ranchi Town","block":"Ranchi"},
          {"pincode":"834008","area":"Doranda","block":"Ranchi"}
        ]},
        "Dhanbad": {"pincodes": [
          {"pincode":"826001","area":"Dhanbad HO","block":"Dhanbad"},
          {"pincode":"826004","area":"Jharia","block":"Dhanbad"}
        ]},
        "Jamshedpur": {"pincodes": [
          {"pincode":"831001","area":"Jamshedpur HO","block":"Jamshedpur"},
          {"pincode":"831002","area":"Bistupur","block":"Jamshedpur"}
        ]},
        "Bokaro": {"pincodes": [
          {"pincode":"827001","area":"Bokaro HO","block":"Bokaro"},
          {"pincode":"827012","area":"Bokaro Steel City","block":"Bokaro"}
        ]},
        "Hazaribagh": {"pincodes": [
          {"pincode":"825301","area":"Hazaribagh HO","block":"Hazaribagh"}
        ]}
      }
    },
    "Karnataka": {
      "districts": {
        "Bengaluru Urban": {"pincodes": [
          {"pincode":"560001","area":"Bengaluru GPO","block":"Bengaluru"},
          {"pincode":"560002","area":"Shivajinagar","block":"Bengaluru"},
          {"pincode":"560008","area":"Domlur","block":"Bengaluru"},
          {"pincode":"560034","area":"Koramangala","block":"Bengaluru"},
          {"pincode":"560038","area":"Indiranagar","block":"Bengaluru"},
          {"pincode":"560068","area":"Whitefield","block":"Bengaluru"},
          {"pincode":"560076","area":"Electronic City","block":"Bengaluru"}
        ]},
        "Mysuru": {"pincodes": [
          {"pincode":"570001","area":"Mysuru HO","block":"Mysuru"},
          {"pincode":"570002","area":"Mysuru City","block":"Mysuru"},
          {"pincode":"571301","area":"Mandya","block":"Mandya"}
        ]},
        "Mangaluru": {"pincodes": [
          {"pincode":"575001","area":"Mangaluru HO","block":"Mangaluru"},
          {"pincode":"575002","area":"Mangaluru City","block":"Mangaluru"}
        ]},
        "Hubballi-Dharwad": {"pincodes": [
          {"pincode":"580001","area":"Hubballi HO","block":"Hubballi"},
          {"pincode":"580029","area":"Dharwad HO","block":"Dharwad"}
        ]},
        "Belagavi": {"pincodes": [
          {"pincode":"590001","area":"Belagavi HO","block":"Belagavi"},
          {"pincode":"591001","area":"Chikodi","block":"Chikodi"}
        ]},
        "Kalaburagi": {"pincodes": [
          {"pincode":"585101","area":"Kalaburagi HO","block":"Kalaburagi"}
        ]},
        "Shivamogga": {"pincodes": [
          {"pincode":"577201","area":"Shivamogga HO","block":"Shivamogga"}
        ]}
      }
    },
    "Kerala": {
      "districts": {
        "Thiruvananthapuram": {"pincodes": [
          {"pincode":"695001","area":"Thiruvananthapuram HO","block":"Thiruvananthapuram"},
          {"pincode":"695002","area":"Statue Junction","block":"Thiruvananthapuram"},
          {"pincode":"695011","area":"Kazhakkoottam","block":"Thiruvananthapuram"}
        ]},
        "Ernakulam": {"pincodes": [
          {"pincode":"682001","area":"Ernakulam HO","block":"Ernakulam"},
          {"pincode":"682002","area":"Ernakulam South","block":"Ernakulam"},
          {"pincode":"682016","area":"Kakkanad","block":"Ernakulam"},
          {"pincode":"682301","area":"Thrippunithura","block":"Ernakulam"}
        ]},
        "Kozhikode": {"pincodes": [
          {"pincode":"673001","area":"Kozhikode HO","block":"Kozhikode"},
          {"pincode":"673002","area":"Kozhikode Town","block":"Kozhikode"}
        ]},
        "Thrissur": {"pincodes": [
          {"pincode":"680001","area":"Thrissur HO","block":"Thrissur"},
          {"pincode":"680004","area":"Thrissur Town","block":"Thrissur"}
        ]},
        "Kollam": {"pincodes": [
          {"pincode":"691001","area":"Kollam HO","block":"Kollam"}
        ]},
        "Malappuram": {"pincodes": [
          {"pincode":"676501","area":"Malappuram HO","block":"Malappuram"}
        ]},
        "Kannur": {"pincodes": [
          {"pincode":"670001","area":"Kannur HO","block":"Kannur"}
        ]},
        "Palakkad": {"pincodes": [
          {"pincode":"678001","area":"Palakkad HO","block":"Palakkad"}
        ]}
      }
    },
    "Madhya Pradesh": {
      "districts": {
        "Bhopal": {"pincodes": [
          {"pincode":"462001","area":"Bhopal GPO","block":"Bhopal"},
          {"pincode":"462002","area":"Bhopal City","block":"Bhopal"},
          {"pincode":"462011","area":"Hamidia Road","block":"Bhopal"},
          {"pincode":"462016","area":"MP Nagar","block":"Bhopal"}
        ]},
        "Indore": {"pincodes": [
          {"pincode":"452001","area":"Indore HO","block":"Indore"},
          {"pincode":"452002","area":"Indore City","block":"Indore"},
          {"pincode":"452010","area":"Vijay Nagar","block":"Indore"}
        ]},
        "Gwalior": {"pincodes": [
          {"pincode":"474001","area":"Gwalior HO","block":"Gwalior"},
          {"pincode":"474002","area":"Gwalior City","block":"Gwalior"}
        ]},
        "Jabalpur": {"pincodes": [
          {"pincode":"482001","area":"Jabalpur HO","block":"Jabalpur"},
          {"pincode":"482002","area":"Jabalpur City","block":"Jabalpur"}
        ]},
        "Ujjain": {"pincodes": [
          {"pincode":"456001","area":"Ujjain HO","block":"Ujjain"}
        ]},
        "Rewa": {"pincodes": [
          {"pincode":"486001","area":"Rewa HO","block":"Rewa"}
        ]},
        "Sagar": {"pincodes": [
          {"pincode":"470001","area":"Sagar HO","block":"Sagar"}
        ]}
      }
    },
    "Maharashtra": {
      "districts": {
        "Mumbai City": {"pincodes": [
          {"pincode":"400001","area":"Mumbai GPO","block":"Fort"},
          {"pincode":"400002","area":"Mandvi","block":"Fort"},
          {"pincode":"400003","area":"Masjid Bunder","block":"Dongri"},
          {"pincode":"400005","area":"Colaba","block":"Colaba"},
          {"pincode":"400020","area":"Churchgate","block":"Churchgate"},
          {"pincode":"400021","area":"Cuffe Parade","block":"Colaba"}
        ]},
        "Mumbai Suburban": {"pincodes": [
          {"pincode":"400051","area":"Bandra West","block":"Bandra"},
          {"pincode":"400069","area":"Andheri West","block":"Andheri"},
          {"pincode":"400076","area":"Powai","block":"Kurla"},
          {"pincode":"400093","area":"Borivali East","block":"Borivali"}
        ]},
        "Pune": {"pincodes": [
          {"pincode":"411001","area":"Pune HO","block":"Pune City"},
          {"pincode":"411002","area":"Deccan Gymkhana","block":"Pune City"},
          {"pincode":"411014","area":"Shivajinagar","block":"Pune City"},
          {"pincode":"411045","area":"Hinjewadi","block":"Mulshi"},
          {"pincode":"411057","area":"Kothrud","block":"Pune City"}
        ]},
        "Nagpur": {"pincodes": [
          {"pincode":"440001","area":"Nagpur HO","block":"Nagpur"},
          {"pincode":"440002","area":"Itwari","block":"Nagpur"},
          {"pincode":"440010","area":"Dharampeth","block":"Nagpur"}
        ]},
        "Thane": {"pincodes": [
          {"pincode":"400601","area":"Thane HO","block":"Thane"},
          {"pincode":"400602","area":"Thane West","block":"Thane"},
          {"pincode":"421001","area":"Kalyan HO","block":"Kalyan"}
        ]},
        "Nashik": {"pincodes": [
          {"pincode":"422001","area":"Nashik HO","block":"Nashik"},
          {"pincode":"422002","area":"Nashik City","block":"Nashik"}
        ]},
        "Aurangabad": {"pincodes": [
          {"pincode":"431001","area":"Aurangabad HO","block":"Aurangabad"}
        ]},
        "Solapur": {"pincodes": [
          {"pincode":"413001","area":"Solapur HO","block":"Solapur"}
        ]},
        "Kolhapur": {"pincodes": [
          {"pincode":"416001","area":"Kolhapur HO","block":"Kolhapur"}
        ]}
      }
    },
    "Manipur": {
      "districts": {
        "Imphal West": {"pincodes": [
          {"pincode":"795001","area":"Imphal HO","block":"Imphal"},
          {"pincode":"795002","area":"Imphal Town","block":"Imphal"},
          {"pincode":"795004","area":"Porompat","block":"Imphal East"}
        ]},
        "Bishnupur": {"pincodes": [
          {"pincode":"795126","area":"Bishnupur HO","block":"Bishnupur"}
        ]},
        "Thoubal": {"pincodes": [
          {"pincode":"795138","area":"Thoubal HO","block":"Thoubal"}
        ]}
      }
    },
    "Meghalaya": {
      "districts": {
        "East Khasi Hills": {"pincodes": [
          {"pincode":"793001","area":"Shillong HO","block":"Shillong"},
          {"pincode":"793002","area":"Laban","block":"Shillong"},
          {"pincode":"793003","area":"Mawlai","block":"Shillong"}
        ]},
        "West Khasi Hills": {"pincodes": [
          {"pincode":"793101","area":"Nongstoin HO","block":"Nongstoin"}
        ]},
        "Jaintia Hills": {"pincodes": [
          {"pincode":"793150","area":"Jowai HO","block":"Jowai"}
        ]}
      }
    },
    "Mizoram": {
      "districts": {
        "Aizawl": {"pincodes": [
          {"pincode":"796001","area":"Aizawl HO","block":"Aizawl"},
          {"pincode":"796005","area":"Zarkawt","block":"Aizawl"},
          {"pincode":"796012","area":"Bawngkawn","block":"Aizawl"}
        ]},
        "Lunglei": {"pincodes": [
          {"pincode":"796701","area":"Lunglei HO","block":"Lunglei"}
        ]}
      }
    },
    "Nagaland": {
      "districts": {
        "Kohima": {"pincodes": [
          {"pincode":"797001","area":"Kohima HO","block":"Kohima"},
          {"pincode":"797002","area":"Kohima Town","block":"Kohima"}
        ]},
        "Dimapur": {"pincodes": [
          {"pincode":"797112","area":"Dimapur HO","block":"Dimapur"},
          {"pincode":"797113","area":"Dimapur Town","block":"Dimapur"}
        ]},
        "Mokokchung": {"pincodes": [
          {"pincode":"798601","area":"Mokokchung HO","block":"Mokokchung"}
        ]}
      }
    },
    "Odisha": {
      "districts": {
        "Khordha": {"pincodes": [
          {"pincode":"751001","area":"Bhubaneswar HO","block":"Bhubaneswar"},
          {"pincode":"751002","area":"Bhubaneswar Town","block":"Bhubaneswar"},
          {"pincode":"751009","area":"Nayapalli","block":"Bhubaneswar"},
          {"pincode":"751024","area":"Patia","block":"Bhubaneswar"}
        ]},
        "Cuttack": {"pincodes": [
          {"pincode":"753001","area":"Cuttack HO","block":"Cuttack"},
          {"pincode":"753002","area":"Cuttack City","block":"Cuttack"}
        ]},
        "Sundargarh": {"pincodes": [
          {"pincode":"769001","area":"Rourkela HO","block":"Rourkela"},
          {"pincode":"769002","area":"Rourkela Steel Township","block":"Rourkela"}
        ]},
        "Sambalpur": {"pincodes": [
          {"pincode":"768001","area":"Sambalpur HO","block":"Sambalpur"}
        ]},
        "Ganjam": {"pincodes": [
          {"pincode":"760001","area":"Berhampur HO","block":"Berhampur"}
        ]},
        "Puri": {"pincodes": [
          {"pincode":"752001","area":"Puri HO","block":"Puri"}
        ]}
      }
    },
    "Punjab": {
      "districts": {
        "Ludhiana": {"pincodes": [
          {"pincode":"141001","area":"Ludhiana HO","block":"Ludhiana"},
          {"pincode":"141002","area":"Ludhiana City","block":"Ludhiana"},
          {"pincode":"141003","area":"Civil Lines","block":"Ludhiana"}
        ]},
        "Amritsar": {"pincodes": [
          {"pincode":"143001","area":"Amritsar HO","block":"Amritsar"},
          {"pincode":"143002","area":"Amritsar City","block":"Amritsar"}
        ]},
        "Jalandhar": {"pincodes": [
          {"pincode":"144001","area":"Jalandhar HO","block":"Jalandhar"},
          {"pincode":"144002","area":"Jalandhar City","block":"Jalandhar"}
        ]},
        "Patiala": {"pincodes": [
          {"pincode":"147001","area":"Patiala HO","block":"Patiala"},
          {"pincode":"147002","area":"Patiala City","block":"Patiala"}
        ]},
        "Bathinda": {"pincodes": [
          {"pincode":"151001","area":"Bathinda HO","block":"Bathinda"}
        ]},
        "Mohali": {"pincodes": [
          {"pincode":"160062","area":"Mohali HO","block":"Mohali"},
          {"pincode":"160055","area":"Phase 7 Mohali","block":"Mohali"}
        ]}
      }
    },
    "Rajasthan": {
      "districts": {
        "Jaipur": {"pincodes": [
          {"pincode":"302001","area":"Jaipur GPO","block":"Jaipur"},
          {"pincode":"302002","area":"Jaipur City","block":"Jaipur"},
          {"pincode":"302006","area":"Vaishali Nagar","block":"Jaipur"},
          {"pincode":"302017","area":"Malviya Nagar","block":"Jaipur"}
        ]},
        "Jodhpur": {"pincodes": [
          {"pincode":"342001","area":"Jodhpur HO","block":"Jodhpur"},
          {"pincode":"342002","area":"Jodhpur City","block":"Jodhpur"}
        ]},
        "Udaipur": {"pincodes": [
          {"pincode":"313001","area":"Udaipur HO","block":"Udaipur"},
          {"pincode":"313002","area":"Udaipur City","block":"Udaipur"}
        ]},
        "Kota": {"pincodes": [
          {"pincode":"324001","area":"Kota HO","block":"Kota"},
          {"pincode":"324002","area":"Kota City","block":"Kota"}
        ]},
        "Ajmer": {"pincodes": [
          {"pincode":"305001","area":"Ajmer HO","block":"Ajmer"}
        ]},
        "Bikaner": {"pincodes": [
          {"pincode":"334001","area":"Bikaner HO","block":"Bikaner"}
        ]},
        "Alwar": {"pincodes": [
          {"pincode":"301001","area":"Alwar HO","block":"Alwar"}
        ]},
        "Bhilwara": {"pincodes": [
          {"pincode":"311001","area":"Bhilwara HO","block":"Bhilwara"}
        ]}
      }
    },
    "Sikkim": {
      "districts": {
        "East Sikkim": {"pincodes": [
          {"pincode":"737101","area":"Gangtok HO","block":"Gangtok"},
          {"pincode":"737102","area":"Gangtok Town","block":"Gangtok"},
          {"pincode":"737103","area":"Tadong","block":"Gangtok"}
        ]},
        "West Sikkim": {"pincodes": [
          {"pincode":"737121","area":"Gyalshing HO","block":"Gyalshing"}
        ]},
        "South Sikkim": {"pincodes": [
          {"pincode":"737128","area":"Namchi HO","block":"Namchi"}
        ]}
      }
    },
    "Tamil Nadu": {
      "districts": {
        "Chennai": {"pincodes": [
          {"pincode":"600001","area":"Chennai GPO","block":"Park Town"},
          {"pincode":"600002","area":"Anna Salai","block":"Chennai Central"},
          {"pincode":"600006","area":"Egmore","block":"Egmore"},
          {"pincode":"600017","area":"Nungambakkam","block":"Nungambakkam"},
          {"pincode":"600018","area":"Kodambakkam","block":"Kodambakkam"},
          {"pincode":"600041","area":"Adyar","block":"Adyar"},
          {"pincode":"600096","area":"OMR","block":"Sholinganallur"}
        ]},
        "Coimbatore": {"pincodes": [
          {"pincode":"641001","area":"Coimbatore HO","block":"Coimbatore"},
          {"pincode":"641002","area":"Coimbatore City","block":"Coimbatore"}
        ]},
        "Madurai": {"pincodes": [
          {"pincode":"625001","area":"Madurai HO","block":"Madurai"},
          {"pincode":"625002","area":"Madurai Town","block":"Madurai"}
        ]},
        "Tiruchirappalli": {"pincodes": [
          {"pincode":"620001","area":"Tiruchirappalli HO","block":"Tiruchirappalli"},
          {"pincode":"620002","area":"Trichy City","block":"Tiruchirappalli"}
        ]},
        "Salem": {"pincodes": [
          {"pincode":"636001","area":"Salem HO","block":"Salem"}
        ]},
        "Tirunelveli": {"pincodes": [
          {"pincode":"627001","area":"Tirunelveli HO","block":"Tirunelveli"}
        ]},
        "Vellore": {"pincodes": [
          {"pincode":"632001","area":"Vellore HO","block":"Vellore"}
        ]},
        "Erode": {"pincodes": [
          {"pincode":"638001","area":"Erode HO","block":"Erode"}
        ]}
      }
    },
    "Telangana": {
      "districts": {
        "Hyderabad": {"pincodes": [
          {"pincode":"500001","area":"Hyderabad GPO","block":"Abids"},
          {"pincode":"500003","area":"Secunderabad HO","block":"Secunderabad"},
          {"pincode":"500016","area":"Begumpet","block":"Begumpet"},
          {"pincode":"500034","area":"Jubilee Hills","block":"Jubilee Hills"},
          {"pincode":"500081","area":"Gachibowli","block":"Serilingampally"},
          {"pincode":"500032","area":"Banjara Hills","block":"Banjara Hills"}
        ]},
        "Warangal": {"pincodes": [
          {"pincode":"506001","area":"Warangal HO","block":"Warangal"},
          {"pincode":"506002","area":"Warangal Town","block":"Warangal"}
        ]},
        "Karimnagar": {"pincodes": [
          {"pincode":"505001","area":"Karimnagar HO","block":"Karimnagar"}
        ]},
        "Nizamabad": {"pincodes": [
          {"pincode":"503001","area":"Nizamabad HO","block":"Nizamabad"}
        ]},
        "Khammam": {"pincodes": [
          {"pincode":"507001","area":"Khammam HO","block":"Khammam"}
        ]}
      }
    },
    "Tripura": {
      "districts": {
        "West Tripura": {"pincodes": [
          {"pincode":"799001","area":"Agartala HO","block":"Agartala"},
          {"pincode":"799002","area":"Agartala Town","block":"Agartala"},
          {"pincode":"799004","area":"Battala","block":"Agartala"}
        ]},
        "South Tripura": {"pincodes": [
          {"pincode":"799143","area":"Udaipur HO","block":"Udaipur"}
        ]},
        "North Tripura": {"pincodes": [
          {"pincode":"799261","area":"Dharmanagar HO","block":"Dharmanagar"}
        ]}
      }
    },
    "Uttar Pradesh": {
      "districts": {
        "Lucknow": {"pincodes": [
          {"pincode":"226001","area":"Lucknow GPO","block":"Lucknow"},
          {"pincode":"226002","area":"Hazratganj","block":"Lucknow"},
          {"pincode":"226010","area":"Gomti Nagar","block":"Lucknow"},
          {"pincode":"226016","area":"Aliganj","block":"Lucknow"}
        ]},
        "Kanpur Nagar": {"pincodes": [
          {"pincode":"208001","area":"Kanpur HO","block":"Kanpur"},
          {"pincode":"208002","area":"Kanpur City","block":"Kanpur"},
          {"pincode":"208012","area":"Swaroop Nagar","block":"Kanpur"}
        ]},
        "Agra": {"pincodes": [
          {"pincode":"282001","area":"Agra HO","block":"Agra"},
          {"pincode":"282002","area":"Agra City","block":"Agra"},
          {"pincode":"282004","area":"Tajganj","block":"Agra"}
        ]},
        "Varanasi": {"pincodes": [
          {"pincode":"221001","area":"Varanasi HO","block":"Varanasi"},
          {"pincode":"221002","area":"Varanasi Town","block":"Varanasi"},
          {"pincode":"221010","area":"Lanka","block":"Varanasi"}
        ]},
        "Prayagraj": {"pincodes": [
          {"pincode":"211001","area":"Prayagraj HO","block":"Prayagraj"},
          {"pincode":"211002","area":"Civil Lines","block":"Prayagraj"}
        ]},
        "Ghaziabad": {"pincodes": [
          {"pincode":"201001","area":"Ghaziabad HO","block":"Ghaziabad"},
          {"pincode":"201010","area":"Indirapuram","block":"Ghaziabad"}
        ]},
        "Noida": {"pincodes": [
          {"pincode":"201301","area":"Noida HO","block":"Noida"},
          {"pincode":"201304","area":"Noida Sector 18","block":"Noida"}
        ]},
        "Meerut": {"pincodes": [
          {"pincode":"250001","area":"Meerut HO","block":"Meerut"}
        ]},
        "Mathura": {"pincodes": [
          {"pincode":"281001","area":"Mathura HO","block":"Mathura"}
        ]}
      }
    },
    "Uttarakhand": {
      "districts": {
        "Dehradun": {"pincodes": [
          {"pincode":"248001","area":"Dehradun HO","block":"Dehradun"},
          {"pincode":"248002","area":"Dehradun City","block":"Dehradun"},
          {"pincode":"248010","area":"Rajpur Road","block":"Dehradun"}
        ]},
        "Haridwar": {"pincodes": [
          {"pincode":"249401","area":"Haridwar HO","block":"Haridwar"},
          {"pincode":"249407","area":"Roorkee HO","block":"Roorkee"}
        ]},
        "Nainital": {"pincodes": [
          {"pincode":"263001","area":"Nainital HO","block":"Nainital"},
          {"pincode":"263139","area":"Haldwani HO","block":"Haldwani"}
        ]},
        "Udham Singh Nagar": {"pincodes": [
          {"pincode":"263153","area":"Rudrapur HO","block":"Rudrapur"}
        ]},
        "Almora": {"pincodes": [
          {"pincode":"263601","area":"Almora HO","block":"Almora"}
        ]}
      }
    },
    "West Bengal": {
      "districts": {
        "Kolkata": {"pincodes": [
          {"pincode":"700001","area":"Kolkata GPO","block":"BBD Bagh"},
          {"pincode":"700012","area":"Shyambazar","block":"North Kolkata"},
          {"pincode":"700013","area":"Cossipore","block":"North Kolkata"},
          {"pincode":"700017","area":"Ballygunge","block":"South Kolkata"},
          {"pincode":"700019","area":"Gariahat","block":"South Kolkata"},
          {"pincode":"700091","area":"Salt Lake City","block":"Bidhannagar"},
          {"pincode":"700064","area":"Jadavpur","block":"South Kolkata"},
          {"pincode":"700107","area":"Rajarhat","block":"North 24 Parganas"}
        ]},
        "Howrah": {"pincodes": [
          {"pincode":"711101","area":"Howrah HO","block":"Howrah"},
          {"pincode":"711102","area":"Howrah Town","block":"Howrah"}
        ]},
        "North 24 Parganas": {"pincodes": [
          {"pincode":"743101","area":"Barasat HO","block":"Barasat"},
          {"pincode":"743201","area":"Bongaon","block":"Bongaon"}
        ]},
        "South 24 Parganas": {"pincodes": [
          {"pincode":"743503","area":"Diamond Harbour","block":"Diamond Harbour"},
          {"pincode":"743329","area":"Canning","block":"Canning"}
        ]},
        "Burdwan": {"pincodes": [
          {"pincode":"713101","area":"Burdwan HO","block":"Burdwan"},
          {"pincode":"713104","area":"Asansol HO","block":"Asansol"}
        ]},
        "Murshidabad": {"pincodes": [
          {"pincode":"742101","area":"Berhampore HO","block":"Berhampore"},
          {"pincode":"742149","area":"Murshidabad HO","block":"Murshidabad"}
        ]},
        "Jalpaiguri": {"pincodes": [
          {"pincode":"735101","area":"Jalpaiguri HO","block":"Jalpaiguri"}
        ]},
        "Alipurduar": {"pincodes": [
          {"pincode":"736122","area":"Alipurduar HO","block":"Alipurduar"},
          {"pincode":"736156","area":"Birpara","block":"Birpara"}
        ]},
        "Darjeeling": {"pincodes": [
          {"pincode":"734001","area":"Darjeeling HO","block":"Darjeeling"},
          {"pincode":"734101","area":"Siliguri HO","block":"Siliguri"},
          {"pincode":"734004","area":"Kurseong","block":"Kurseong"}
        ]},
        "Cooch Behar": {"pincodes": [
          {"pincode":"736101","area":"Cooch Behar HO","block":"Cooch Behar"},
          {"pincode":"736135","area":"Dinhata","block":"Dinhata"}
        ]},
        "Malda": {"pincodes": [
          {"pincode":"732101","area":"Malda HO","block":"Malda"},
          {"pincode":"732201","area":"Old Malda","block":"Old Malda"}
        ]},
        "Nadia": {"pincodes": [
          {"pincode":"741101","area":"Krishnanagar HO","block":"Krishnanagar"},
          {"pincode":"741234","area":"Ranaghat","block":"Ranaghat"}
        ]},
        "Midnapore": {"pincodes": [
          {"pincode":"721101","area":"Midnapore HO","block":"Midnapore"}
        ]}
      }
    },
    "Delhi": {
      "districts": {
        "New Delhi": {"pincodes": [
          {"pincode":"110001","area":"New Delhi GPO","block":"Connaught Place"},
          {"pincode":"110002","area":"Sansad Marg","block":"New Delhi"},
          {"pincode":"110003","area":"Lodi Road","block":"New Delhi"},
          {"pincode":"110011","area":"Jor Bagh","block":"New Delhi"}
        ]},
        "Central Delhi": {"pincodes": [
          {"pincode":"110005","area":"Karol Bagh","block":"Karol Bagh"},
          {"pincode":"110006","area":"Daryaganj","block":"Civil Lines"},
          {"pincode":"110007","area":"Paharganj","block":"Paharganj"}
        ]},
        "South Delhi": {"pincodes": [
          {"pincode":"110016","area":"Hauz Khas","block":"Hauz Khas"},
          {"pincode":"110017","area":"Safdarjung Enclave","block":"South Delhi"},
          {"pincode":"110049","area":"Defence Colony","block":"South Delhi"},
          {"pincode":"110048","area":"Greater Kailash","block":"South Delhi"}
        ]},
        "North Delhi": {"pincodes": [
          {"pincode":"110009","area":"Civil Lines","block":"Civil Lines"},
          {"pincode":"110054","area":"Model Town","block":"Model Town"}
        ]},
        "East Delhi": {"pincodes": [
          {"pincode":"110092","area":"Laxmi Nagar","block":"Laxmi Nagar"},
          {"pincode":"110096","area":"Preet Vihar","block":"Preet Vihar"}
        ]},
        "West Delhi": {"pincodes": [
          {"pincode":"110018","area":"Tilak Nagar","block":"Tilak Nagar"},
          {"pincode":"110015","area":"Janakpuri","block":"Janakpuri"}
        ]},
        "North West Delhi": {"pincodes": [
          {"pincode":"110033","area":"Rohini","block":"Rohini"},
          {"pincode":"110085","area":"Pitampura","block":"Pitampura"}
        ]},
        "South West Delhi": {"pincodes": [
          {"pincode":"110045","area":"Dwarka","block":"Dwarka"},
          {"pincode":"110037","area":"Palam","block":"Palam"}
        ]}
      }
    },
    "Jammu and Kashmir": {
      "districts": {
        "Srinagar": {"pincodes": [
          {"pincode":"190001","area":"Srinagar HO","block":"Srinagar"},
          {"pincode":"190002","area":"Lal Chowk","block":"Srinagar"},
          {"pincode":"190008","area":"Rajbagh","block":"Srinagar"}
        ]},
        "Jammu": {"pincodes": [
          {"pincode":"180001","area":"Jammu HO","block":"Jammu"},
          {"pincode":"180002","area":"Jammu City","block":"Jammu"},
          {"pincode":"180004","area":"Gandhi Nagar","block":"Jammu"}
        ]},
        "Anantnag": {"pincodes": [
          {"pincode":"192101","area":"Anantnag HO","block":"Anantnag"}
        ]},
        "Baramulla": {"pincodes": [
          {"pincode":"193101","area":"Baramulla HO","block":"Baramulla"}
        ]}
      }
    },
    "Ladakh": {
      "districts": {
        "Leh": {"pincodes": [
          {"pincode":"194101","area":"Leh HO","block":"Leh"},
          {"pincode":"194104","area":"Leh Town","block":"Leh"}
        ]},
        "Kargil": {"pincodes": [
          {"pincode":"194103","area":"Kargil HO","block":"Kargil"}
        ]}
      }
    },
    "Chandigarh": {
      "districts": {
        "Chandigarh": {"pincodes": [
          {"pincode":"160001","area":"Chandigarh HO","block":"Sector 17"},
          {"pincode":"160011","area":"Sector 11","block":"Chandigarh"},
          {"pincode":"160014","area":"Sector 14","block":"Chandigarh"},
          {"pincode":"160019","area":"Sector 19","block":"Chandigarh"},
          {"pincode":"160022","area":"Sector 22","block":"Chandigarh"},
          {"pincode":"160036","area":"Sector 36","block":"Chandigarh"}
        ]}
      }
    },
    "Puducherry": {
      "districts": {
        "Puducherry": {"pincodes": [
          {"pincode":"605001","area":"Puducherry HO","block":"Puducherry"},
          {"pincode":"605002","area":"Nellithope","block":"Puducherry"},
          {"pincode":"605005","area":"Lawspet","block":"Puducherry"}
        ]},
        "Karaikal": {"pincodes": [
          {"pincode":"609601","area":"Karaikal HO","block":"Karaikal"}
        ]}
      }
    },
    "Andaman and Nicobar Islands": {
      "districts": {
        "South Andaman": {"pincodes": [
          {"pincode":"744101","area":"Port Blair HO","block":"Port Blair"},
          {"pincode":"744102","area":"Carbyns Cove","block":"Port Blair"},
          {"pincode":"744103","area":"Haddo","block":"Port Blair"}
        ]},
        "North and Middle Andaman": {"pincodes": [
          {"pincode":"744201","area":"Rangat HO","block":"Rangat"},
          {"pincode":"744202","area":"Mayabunder","block":"Mayabunder"}
        ]}
      }
    },
    "Dadra and Nagar Haveli and Daman and Diu": {
      "districts": {
        "Dadra and Nagar Haveli": {"pincodes": [
          {"pincode":"396230","area":"Silvassa HO","block":"Silvassa"},
          {"pincode":"396235","area":"Naroli","block":"Naroli"}
        ]},
        "Daman": {"pincodes": [
          {"pincode":"396210","area":"Daman HO","block":"Daman"}
        ]},
        "Diu": {"pincodes": [
          {"pincode":"362520","area":"Diu HO","block":"Diu"}
        ]}
      }
    },
    "Lakshadweep": {
      "districts": {
        "Lakshadweep": {"pincodes": [
          {"pincode":"682551","area":"Kavaratti HO","block":"Kavaratti"},
          {"pincode":"682552","area":"Agatti","block":"Agatti"},
          {"pincode":"682553","area":"Amini","block":"Amini"},
          {"pincode":"682554","area":"Androth","block":"Androth"}
        ]}
      }
    }
  }
}

# Add metadata counts
total_records = 0
total_districts = 0
for state, sdata in data["data"].items():
    d_count = len(sdata["districts"])
    total_districts += d_count
    for dist, ddata in sdata["districts"].items():
        total_records += len(ddata["pincodes"])

data["total_states_uts"] = len(data["data"])
data["total_districts"] = total_districts
data["total_pincode_entries"] = total_records

with open("/home/souren/Desktop/3SAWENX_software/3SA-pharma-MobileApp/india_pincode_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done. States/UTs: {data['total_states_uts']}, Districts: {total_districts}, Pincode entries: {total_records}")
