import{M as e,i as t,n,nt as r,r as i,rt as a,t as o}from"./firebase-config-C2qyLbUU.js";import{collection as s,deleteDoc as c,doc as l,getDoc as u,getDocs as d,serverTimestamp as f,setDoc as p,writeBatch as m}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";import{onAuthStateChanged as h,signOut as g}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";var _,v=a((()=>{_={id:{language:{label:`Bahasa / Language`},dashboard:{welcomeGreeting:`Halo, selamat datang! 👋`,welcomeDescription:`Yuk, pantau asupan nutrisi dan jaga kesehatanmu hari ini.`},calorieCard:{dailyIntake:`ASUPAN KALORI HARIAN`,consumed:`Kalori yang sudah dikonsumsi`,dailyProgress:`Progress harian`,target:`Target`,alreadyConsumed:`Sudah dikonsumsi`,remaining:`Sisa`,kcal:`kkal`},nutritionOverview:{title:`Asupan Nutrisi`,protein:`Protein`,carbs:`Karbo`,fat:`Lemak`,water:`Air`,waterUnit:`ml`,target:`Target`,unit:`g`},foodTracker:{title:`Catat Makanan`,addPhoto:`Tambah Foto Makanan`,previewAlt:`Pratinjau makanan`,analyze:`Analisis Makanan`,aiResult:`Hasil Identifikasi`,manualTitle:`Input Manual`,manualDescription:`Catat makanan tanpa menggunakan foto.`,foodName:`Nama makanan`,foodNamePlaceholder:`Contoh: Nasi putih`,foodWeight:`Berat makanan`,gram:`gram`,calculate:`Hitung Nutrisi`,suggestions:`Makanan yang mungkin Anda maksud:`,resultTitle:`Estimasi Nutrisi`,cancel:`Batal`,save:`Simpan Makanan`},foodEditModal:{editTitle:`Edit Makanan`,addTitle:`Tambah Makanan`,foodName:`Nama makanan`,foodNamePlaceholder:`Cari nama makanan Panganku...`,foodWeight:`Berat makanan`,weightPlaceholder:`Berat makanan`,gram:`gram`,hint:`Pilih makanan dari Panganku sebelum menyimpan.`,delete:`Hapus Makanan`,yes:`Ya`,cancel:`Batal`,saveChanges:`Simpan Perubahan`,addFood:`Tambahkan Makanan`,notFound:`Makanan tidak ditemukan di Panganku.`,selected:`Dipilih:`,confirmDelete:`Apakah Anda yakin ingin menghapus`,fromAnalysis:`dari hasil analisis?`,calories:`kkal`,per100g:`100 g`},foodScanner:{fileNotSelected:`File Belum Dipilih`,selectImageFirst:`Silakan pilih file gambar terlebih dahulu.`,selectFoodPhoto:`Silakan pilih file foto makanan terlebih dahulu.`,analyzing:`sedang menganalisis foto makanan...`,foundFoods:`menemukan`,foods:`makanan.`,analysisError:`Terjadi kesalahan.`,estimatedWeight:`Perkiraan berat:`,gram:`gram`,aiConfidence:`Keyakinan:`,unknown:`Tidak diketahui`,protein:`Protein`,carbohydrates:`Karbohidrat`,fat:`Lemak`,water:`Air`,nutritionNotFound:`Data nutrisi belum ditemukan.`,nutritionNotFoundTitle:`Data nutrisi belum ditemukan`,edit:`Edit`,addFood:`Tambah Makanan`,manuallySelected:`Dipilih manual`,totalNutrition:`Total Nutrisi Makanan`,saveFood:`Simpan Makanan`,noData:`Belum ada data`,noFoodNutrition:`Belum ada makanan dengan data nutrisi yang bisa disimpan.`,photoMenu:`Menu dari foto`,success:`Berhasil`,foodSaved:`Makanan berhasil disimpan.`,cancel:`Batal`,yes:`Ya`,cancelIdentification:`Batalkan hasil identifikasi makanan?`,noSuggestion:`belum ditemukan dalam database.`,tryOtherFood:`Coba gunakan nama makanan lain atau nama yang lebih spesifik.`,enterFoodData:`Isi Data Makanan`,enterValidFood:`Isi nama makanan dan berat dengan benar.`,emptyData:`Data Kosong`,dataUnavailable:`Data tidak tersedia.`,resetAll:`Reset seluruh isian dan hasil analisis makanan?`,resetSuccess:`Reset berhasil.`,greeting:`Halo, selamat datang! 👋`,calories:`kkal`,per100g:`100 g`,menuFromPhoto:`Menu dari foto`,searchingDatabase:`Mencari database...`,nutritionResult:`Hasil nutrisi`,deleteConfirm:`Apakah Anda yakin ingin menghapus seluruh isian dan hasil analisis makanan?`,preparingPhoto:`Menyiapkan foto...`,preparingPhotoDescription:`Mengoptimalkan gambar makanan`,recognizingFood:`Mengenali makanan...`,recognizingFoodDescription:`Mengidentifikasi makanan pada foto`,identifyingComposition:`Mengidentifikasi komposisi makanan...`,identifyingCompositionDescription:`Menyusun daftar makanan yang ditemukan`,calculatingNutrition:`Menghitung kandungan nutrisi...`,calculatingNutritionDescription:`Memeriksa data dan menghitung nilai nutrisi`,preparingResults:`Menyiapkan hasil analisis...`,preparingResultsDescription:`Menyelesaikan rincian kandungan nutrisi`,analysisComplete:`Analisis selesai!`,analysisCompleteDescription:`Hasil makanan siap diperiksa`},foodHistory:{eyebrow:`Catatan makananmu`,title:`Riwayat Makanan`,description:`Lihat kembali makanan dan kalori yang sudah dicatat.`},historyPage:{dateLabel:`Pilih tanggal riwayat`,reset:`Reset`,allHistory:`Semua riwayat`,recordCount:`catatan`},historyDynamic:{unknownDate:`Tanggal tidak diketahui`,calories:`Kalori`,protein:`Protein`,carbohydrates:`Karbohidrat`,fat:`Lemak`,fiber:`Serat`,sodium:`Natrium`,water:`Air`,macro:`Makro`,carbohydrateShort:`Karbo`,incompleteMacro:`Data makro belum lengkap untuk menampilkan grafik.`,nutritionPerformance:`Nutrition performance`,dailySummary:`Ringkasan harian`,totalCalories:`Total asupan kalori`,calorieBadge:`KALORI`,dailyTarget:`Target harian`,notSet:`Belum diatur`,achieved:`tercapai`,remaining:`Sisa`,exceeded:`Melebihi`,setCalorieTarget:`Atur target kalori di profil untuk melihat progres.`,incompleteCalories:`Data kalori belum lengkap.`,nutritionComposition:`Komposisi nutrisi`,macroDistribution:`Distribusi makronutrisi`,nutritionDetails:`Detail nutrisi`,totalIntake:`Total asupan`,food:`Makanan`,foodRecord:`Catatan makanan`,weightUnavailable:`Berat tidak tersedia`,gram:`gram`,nutritionInfo:`Info Nutrisi`,closeInfo:`Tutup Info`,noHistory:`Tidak ada riwayat`,noHistoryDate:`Tidak ada makanan yang disimpan pada tanggal ini.`,emptyHistory:`Belum ada riwayat`,emptyHistoryDescription:`Makanan yang kamu simpan akan muncul di sini.`},statisticsPage:{eyebrow:`Perkembangan kesehatanmu`,title:`Statistik`,description:`Pantau pola konsumsi kalori dan nutrisi.`},statisticsFilter:{title:`Periode Statistik`,days7:`7 Hari`,days30:`30 Hari`,all:`Semua`},statisticsSummary:{title:`Ringkasan Konsumsi`,totalCalories:`Total Kalori`,averageCalories:`Rata-rata Kalori`,totalMeals:`Total Makanan`,recordedDays:`Hari Tercatat`,kcal:`kkal`,kcalPerDay:`kkal/hari`,records:`catatan`,days:`hari`},statisticsChart:{calorieTitle:`Grafik Kalori Harian`,noData:`Belum ada data statistik.`},statisticsGoal:{journey:`Perjalanan Anda`,title:`Menuju Berat Badan Tujuan`,empty:`Lengkapi profil dan tujuan berat badan untuk melihat progres Anda.`},statisticsNutrition:{title:`Total Asupan Nutrisi`,protein:`Protein`,carbohydrates:`Karbohidrat`,fat:`Lemak`},statisticsDynamic:{unknown:`Tidak diketahui`,previousPeriodUnavailable:`Belum ada data periode sebelumnya`,comparedPrevious:`dibanding periode sebelumnya`,increased:`Naik`,decreased:`Turun`,unchanged:`Tidak berubah`,completeProfile:`Lengkapi profil dan tujuan berat badan untuk melihat simulasi progres Anda.`,currentWeight:`Berat saat ini`,goalWeight:`Berat tujuan`,goalChange:`Perubahan tujuan`,lose:`menurunkan`,gain:`menaikkan`,duration:`Target waktu`,months:`bulan`,averageIntake:`Rata-rata konsumsi`,dailyTarget:`Target`,perDay:`kkal/hari`,closeToTarget:`Rata-rata kalori Anda sangat dekat dengan target harian.`,aboveTarget:`Rata-rata konsumsi Anda`,belowTarget:`Rata-rata konsumsi Anda`,aboveTargetEnd:`kkal di atas target.`,belowTargetEnd:`kkal di bawah target.`,noData:`Belum ada data statistik.`,targetLabel:`Target`,successful:`Berhasil memenuhi target`,exceededTarget:`Melebihi target`,according:`Sesuai`,exceeded:`Melebihi`},profile:{settingsTitle:`Pengaturan akun`,title:`Profil Saya`,description:`Kelola informasi tubuh dan target nutrisi harianmu.`,wizard:{startTitle:`Data Diri`,startDescription:`Lengkapi informasi dan target tubuhmu`,stepLabel:`LANGKAH 1 DARI 4`,personalTitle:`Data Diri`,personalNote:`Mulai dengan melengkapi informasi dasar dirimu.`,name:`Nama`,namePlaceholder:`Masukkan nama`,age:`Usia`,agePlaceholder:`Contoh: 30`,gender:`Jenis kelamin`,genderPlaceholder:`Pilih jenis kelamin`,male:`Laki-laki`,female:`Perempuan`,bodyTitle:`Data Tubuh`,bodyNote:`Masukkan ukuran tubuhmu saat ini.`,weight:`Berat badan`,weightPlaceholder:`Contoh: 70`,height:`Tinggi badan`,heightPlaceholder:`Contoh: 170`,activityTitle:`Aktivitas Harian`,activityNote:`Pilih tingkat aktivitas yang paling menggambarkan keseharianmu.`,activity:`Tingkat aktivitas`,activityPlaceholder:`Pilih aktivitas`,sedentary:`Sangat ringan`,light:`Ringan`,moderate:`Sedang`,active:`Aktif`,veryActive:`Sangat aktif`,goalTitle:`Tujuan Berat Badan`,goalNote:`Tentukan berat badan yang ingin dicapai dan waktu pencapaiannya.`,goalWeight:`Berat badan tujuan`,goalWeightPlaceholder:`Contoh: 80`,duration:`Target waktu`,durationPlaceholder:`Pilih target waktu`,month:`bulan`,back:`Kembali`,next:`Lanjut`},identity:{defaultName:`Nama Pengguna`,notLoggedIn:`Belum login`,emailUnavailable:`Email tidak tersedia`},wizardButtons:{finish:`Selesai ✓`,next:`Lanjut →`},photo:{fileNotSelected:`File Belum Dipilih`,selectImage:`Silakan pilih file gambar terlebih dahulu.`,updateSuccess:`Foto berhasil diperbarui.`,updateFailed:`Foto gagal diperbarui. Coba foto lain.`,failed:`Gagal`},reset:{title:`Reset Semua Data?`,message:`Profil, riwayat makanan, dan target nutrisi akan dihapus dari perangkat dan cloud. Akun Google tetap login.`,confirm:`Ya, Reset`,cancel:`Batal`,successTitle:`Reset Berhasil`,successMessage:`Semua data pengguna berhasil dihapus. Akun Google Anda tetap login.`,failedTitle:`Reset Gagal`,failedMessage:`Data cloud belum berhasil dihapus seluruhnya. Data lokal tetap dipertahankan. Periksa koneksi internet dan izin Firestore, lalu coba reset kembali.`},validation:{incompleteTitle:`Data belum lengkap`,incompleteMessage:`Mohon lengkapi data profil pengguna.`,invalidNumberTitle:`Masukkan angka yang benar`,invalidNumberMessage:`Data yang dimasukkan tidak valid.`},saveMessages:{success:`Profil berhasil disimpan.`,failed:`Profil gagal disimpan.`},simulation:{title:`Simulasi Tujuan Berat Badan`,message:`Lengkapi profil untuk melihat simulasi.`,currentWeight:`Berat saat ini`,goalWeight:`Berat tujuan`,weightDifference:`Selisih berat`,duration:`Target waktu`,energyNeeds:`Kebutuhan Energi`,bmr:`BMR`,tdee:`TDEE`,calorieSimulation:`Simulasi Kalori`,weeklyChange:`Perubahan berat/minggu`,dailyAdjustment:`Defisit / surplus harian`,dailyCalorieTarget:`Target konsumsi kalori harian`,infoButton:`Informasi BMR & TDEE`,infoButtonLabel:`Informasi BMR dan TDEE`,invalidData:`Lengkapi data profil, target berat badan, dan target waktu untuk melihat simulasi.`,invalidActivity:`Pilihan aktivitas tidak valid.`,maintenance:`Pemeliharaan`,noChange:`Tidak ada perubahan`,decrease:`Turun`,increase:`Naik`,realistic:`Realistis`,aggressive:`Agresif`,notRecommended:`Tidak disarankan`,deficit:`Defisit`,surplus:`Surplus`,warningAggressiveLoss:`Target tergolong agresif. Pertimbangkan pemantauan dan evaluasi berkala.`,warningFastLoss:`Target penurunan terlalu cepat. Sebaiknya evaluasi kembali durasi target bersama tenaga kesehatan.`,warningAggressiveGain:`Target kenaikan tergolong agresif. Pantau perubahan berat dan kondisi tubuh secara berkala.`,warningFastGain:`Target kenaikan terlalu cepat. Sebaiknya evaluasi kembali durasi target.`,warningInvalidCalories:`Hasil target kalori tidak layak dijadikan panduan konsumsi. Evaluasi kembali target dan durasinya.`,warningBelowBmr:`Estimasi target kalori berada di bawah BMR. Jangan langsung menerapkannya tanpa evaluasi dengan tenaga kesehatan.`,month:`bulan`,kcalPerDay:`kkal/hari`,simulationMessage:`Simulasi berdasarkan data profil Anda.`},info:{close:`Tutup informasi`,title:`Mengenal BMR dan TDEE`,bmrTitle:`1. BMR (Basal Metabolic Rate)`,bmrDescription:`BMR adalah jumlah kalori yang dibutuhkan tubuh saat istirahat untuk menjalankan fungsi dasar, seperti bernapas, memompa darah, menjaga suhu tubuh, dan menjalankan fungsi organ.`,tdeeTitle:`2. TDEE (Total Daily Energy Expenditure)`,tdeeDescription:`TDEE adalah perkiraan total kalori yang dibakar tubuh dalam sehari, termasuk aktivitas harian dan olahraga.`,exampleTitle:`Contoh perhitungan`,bmrExample:`BMR: 1.800 kkal/hari`,activityExample:`Faktor aktivitas: 1,55`,tdeeExample:`TDEE: 1.800 × 1,55 = 2.790 kkal/hari`,relationshipTitle:`3. Hubungannya dengan berat badan`,maintain:`Kalori sesuai TDEE: membantu mempertahankan berat badan.`,deficit:`Kalori di bawah TDEE: menciptakan defisit energi.`,surplus:`Kalori di atas TDEE: menciptakan surplus energi.`,note:`Angka BMR dan TDEE merupakan estimasi. Kebutuhan energi sebenarnya dapat berbeda pada setiap orang.`},nutrition:{title:`Target Harian`,calories:`Target kalori`,protein:`Target protein`,carbs:`Target karbohidrat`,fat:`Target lemak`,kcal:`kkal`,gram:`gram`,note:`Target nutrisi dihitung otomatis berdasarkan data tubuh, aktivitas harian, dan tujuan berat badan.`},actions:{save:`Simpan Profil`,reset:`Reset Semua Data`}},identity:{uploadPhoto:`Unggah foto profil`,changePhoto:`Klik untuk mengganti foto profil`,photoAlt:`Foto profil`,defaultName:`Nama Pengguna`,logout:`Keluar`,logoutTitle:`Keluar dari KaloriKu?`,logoutMessage:`Apakah kamu yakin ingin keluar? Data lokal KaloriKu pada perangkat ini akan dihapus.`,logoutCancel:`Batal`,logoutConfirm:`Ya, Keluar`},modal:{success:`Berhasil`,error:`Terjadi Kesalahan`,warning:`Perhatian`,info:`Informasi`,confirmation:`Konfirmasi`,yes:`Ya`,cancel:`Batal`,ok:`OK`},navigation:{home:`Beranda`,history:`Riwayat`,statistics:`Statistik`,profile:`Profil`},footer:{copyright:`KaloriKu © 2026`,disclaimer:`Hasil perhitungan merupakan estimasi.`},appModal:{title:`Informasi`,cancel:`Batal`,confirm:`OK`},onboarding:{slides:{welcomeTitle:`Hidup lebih sehat dimulai dari sini.`,welcomeDescription:`Kenali pola makanmu, pantau nutrisi, dan capai target kesehatan bersama KaloriKu.`,foodTitle:`Catat makanan dengan mudah.`,foodDescription:`Simpan makanan yang kamu konsumsi dan ketahui kandungan nutrisinya.`,aiTitle:`Kenali makanan dengan AI.`,aiDescription:`Ambil foto makanan dan biarkan AI membantu mengenali makanan serta memperkirakan porsinya.`,goalTitle:`Pantau progres kesehatanmu.`,goalDescription:`Tetapkan target kalori dan nutrisi, lalu pantau perkembanganmu setiap hari.`,next:`Lanjutkan`,back:`Kembali`,skip:`Lewati`,start:`Mulai Sekarang`,slide:`Slide`},tour:{calorieTitle:`Pantau kalori harianmu`,calorieDescription:`Di sini kamu dapat melihat jumlah kalori yang sudah dikonsumsi, target harian, dan sisa kalori yang tersedia.`,nutritionTitle:`Kenali asupan nutrisimu`,nutritionDescription:`Pantau protein, karbohidrat, lemak, dan air untuk memahami keseimbangan nutrisi harianmu.`,scanTitle:`Catat makanan dengan mudah`,scanDescription:`Gunakan AI untuk mengenali makanan melalui foto, atau masukkan makanan secara manual untuk menghitung nutrisinya.`,historyTitle:`Lihat riwayat makanan`,historyDescription:`Semua makanan yang sudah kamu catat dapat dilihat kembali di halaman riwayat.`,statisticsTitle:`Pantau perkembanganmu`,statisticsDescription:`Lihat grafik dan ringkasan konsumsi kalori untuk memahami perkembangan pola makanmu.`,profileTitle:`Atur profil dan targetmu`,profileDescription:`Lengkapi data tubuh dan atur target kalori serta nutrisi harian agar sesuai dengan kebutuhanmu.`,step:`Langkah`,of:`dari`,next:`Lanjutkan`,back:`Kembali`,finish:`Selesai`,skip:`Lewati`}}},en:{language:{label:`Language`},dashboard:{welcomeGreeting:`Hello, welcome! 👋`,welcomeDescription:`Let's track your nutrition intake and stay healthy today.`},calorieCard:{dailyIntake:`DAILY CALORIE INTAKE`,consumed:`Calories consumed`,dailyProgress:`Daily progress`,target:`Target`,alreadyConsumed:`Consumed`,remaining:`Remaining`,kcal:`kcal`},nutritionOverview:{title:`Nutrition Intake`,protein:`Protein`,carbs:`Carbs`,fat:`Fat`,water:`Water`,waterUnit:`ml`,target:`Target`,unit:`g`},foodTracker:{title:`Food Tracker`,addPhoto:`Add Food Photo`,previewAlt:`Food preview`,analyze:`Analyze Food`,aiResult:`Identification Results`,manualTitle:`Manual Entry`,manualDescription:`Record food without using a photo.`,foodName:`Food Name`,foodNamePlaceholder:`Example: White rice`,foodWeight:`Food Weight`,gram:`grams`,calculate:`Calculate Nutrition`,suggestions:`Foods you may be referring to:`,resultTitle:`Estimated Nutrition`,cancel:`Cancel`,save:`Save Food`},foodEditModal:{editTitle:`Edit Food`,addTitle:`Add Food`,foodName:`Food name`,foodNamePlaceholder:`Search Panganku foods...`,foodWeight:`Food weight`,weightPlaceholder:`Food weight`,gram:`grams`,hint:`Select a food from Panganku before saving.`,delete:`Delete Food`,yes:`Yes`,cancel:`Cancel`,saveChanges:`Save Changes`,addFood:`Add Food`,notFound:`Food not found in Panganku.`,selected:`Selected:`,confirmDelete:`Are you sure you want to delete`,fromAnalysis:`from the analysis results?`,calories:`kcal`,per100g:`100 g`},foodScanner:{fileNotSelected:`No File Selected`,selectImageFirst:`Please select an image file first.`,selectFoodPhoto:`Please select a food photo first.`,analyzing:`analyzing the food photo...`,foundFoods:`found`,foods:`food items.`,analysisError:`An error occurred .`,estimatedWeight:`Estimated weight:`,gram:`grams`,aiConfidence:`confidence:`,unknown:`Unknown`,protein:`Protein`,carbohydrates:`Carbohydrates`,fat:`Fat`,water:`Water`,nutritionNotFound:`Nutrition data not found.`,nutritionNotFoundTitle:`Nutrition data not found`,edit:`Edit`,addFood:`Add Food`,manuallySelected:`Manually selected`,totalNutrition:`Total Food Nutrition`,saveFood:`Save Food`,noData:`No Data`,noFoodNutrition:`There are no foods with available nutrition data to save.`,photoMenu:`Meal from photo`,success:`Success`,foodSaved:`Food saved successfully.`,cancel:`Cancel`,yes:`Yes`,cancelIdentification:`Cancel food identification results?`,noSuggestion:`was not found in the database.`,tryOtherFood:`Try another food name or use a more specific name.`,enterFoodData:`Enter Food Details`,enterValidFood:`Enter a valid food name and weight.`,emptyData:`Empty Data`,dataUnavailable:`Data is unavailable.`,resetAll:`Reset all food entries and analysis results?`,resetSuccess:`Reset successful.`,greeting:`Hello, welcome! 👋`,calories:`kcal`,per100g:`100 g`,menuFromPhoto:`Meal from photo`,searchingDatabase:`Searching database...`,nutritionResult:`Nutrition results`,deleteConfirm:`Are you sure you want to reset all food entries and analysis results?`,preparingPhoto:`Preparing photo...`,preparingPhotoDescription:`Optimizing the food image`,recognizingFood:`Recognizing food...`,recognizingFoodDescription:`Identifying food in the photo`,identifyingComposition:`Identifying food composition...`,identifyingCompositionDescription:`Organizing the detected food items`,calculatingNutrition:`Calculating nutritional values...`,calculatingNutritionDescription:`Checking data and calculating nutrition`,preparingResults:`Preparing results...`,preparingResultsDescription:`Finalizing nutritional details`,analysisComplete:`Analysis complete!`,analysisCompleteDescription:`Your food results are ready to review`},foodHistory:{eyebrow:`Your food records`,title:`Food History`,description:`Review the foods and calories you have recorded.`},historyPage:{dateLabel:`Select history date`,reset:`Reset`,allHistory:`All History`,recordCount:`records`},historyDynamic:{unknownDate:`Unknown date`,calories:`Calories`,protein:`Protein`,carbohydrates:`Carbohydrates`,fat:`Fat`,fiber:`Fiber`,sodium:`Sodium`,water:`Water`,macro:`Macros`,carbohydrateShort:`Carbs`,incompleteMacro:`Incomplete macro data. Unable to display the chart.`,nutritionPerformance:`Nutrition performance`,dailySummary:`Daily summary`,totalCalories:`Total calorie intake`,calorieBadge:`CALORIES`,dailyTarget:`Daily target`,notSet:`Not set`,achieved:`achieved`,remaining:`Remaining`,exceeded:`Exceeded by`,setCalorieTarget:`Set your calorie target in your profile to view progress.`,incompleteCalories:`Incomplete calorie data.`,nutritionComposition:`Nutrition composition`,macroDistribution:`Macronutrient distribution`,nutritionDetails:`Nutrition details`,totalIntake:`Total intake`,food:`Food`,foodRecord:`Food record`,weightUnavailable:`Weight unavailable`,gram:`grams`,nutritionInfo:`Nutrition Info`,closeInfo:`Close Info`,noHistory:`No history found`,noHistoryDate:`No food was saved on this date.`,emptyHistory:`No history yet`,emptyHistoryDescription:`The food you save will appear here.`},statisticsPage:{eyebrow:`Your health progress`,title:`Statistics`,description:`Track your calorie and nutrition intake patterns.`},statisticsFilter:{title:`Statistics Period`,days7:`7 Days`,days30:`30 Days`,all:`All`},statisticsSummary:{title:`Consumption Summary`,totalCalories:`Total Calories`,averageCalories:`Average Calories`,totalMeals:`Total Meals`,recordedDays:`Recorded Days`,kcal:`kcal`,kcalPerDay:`kcal/day`,records:`records`,days:`days`},statisticsChart:{calorieTitle:`Daily Calorie Chart`,noData:`No statistical data available yet.`},statisticsGoal:{journey:`Your Journey`,title:`Towards Your Goal Weight`,empty:`Complete your profile and weight goal to see your progress.`},statisticsNutrition:{title:`Total Nutrient Intake`,protein:`Protein`,carbohydrates:`Carbohydrates`,fat:`Fat`},statisticsDynamic:{unknown:`Unknown`,previousPeriodUnavailable:`No data from the previous period`,comparedPrevious:`compared to the previous period`,increased:`Increased`,decreased:`Decreased`,unchanged:`Unchanged`,completeProfile:`Complete your profile and weight goal to see your progress simulation.`,currentWeight:`Current Weight`,goalWeight:`Goal Weight`,goalChange:`Goal Change`,lose:`lose`,gain:`gain`,duration:`Target Duration`,months:`months`,averageIntake:`Average Intake`,dailyTarget:`Target`,perDay:`kcal/day`,closeToTarget:`Your average calorie intake is very close to your daily target.`,aboveTarget:`Your average intake is`,belowTarget:`Your average intake is`,aboveTargetEnd:`kcal above your target.`,belowTargetEnd:`kcal below your target.`,noData:`No statistical data available yet.`,targetLabel:`Target`,successful:`Successfully within target`,exceededTarget:`Exceeded target`,according:`On target`,exceeded:`Exceeded`},profile:{settingsTitle:`Account Settings`,title:`My Profile`,description:`Manage your body information and daily nutrition goals.`,wizard:{startTitle:`Personal Information`,startDescription:`Complete your information and body goals`,stepLabel:`STEP 1 OF 4`,personalTitle:`Personal Information`,personalNote:`Start by completing your basic information.`,name:`Name`,namePlaceholder:`Enter your name`,age:`Age`,agePlaceholder:`Example: 30`,gender:`Gender`,genderPlaceholder:`Select gender`,male:`Male`,female:`Female`,bodyTitle:`Body Measurements`,bodyNote:`Enter your current body measurements.`,weight:`Weight`,weightPlaceholder:`Example: 70`,height:`Height`,heightPlaceholder:`Example: 170`,activityTitle:`Daily Activity`,activityNote:`Choose the activity level that best describes your daily routine.`,activity:`Activity level`,activityPlaceholder:`Select activity level`,sedentary:`Sedentary`,light:`Light`,moderate:`Moderate`,active:`Active`,veryActive:`Very Active`,goalTitle:`Weight Goal`,goalNote:`Set your desired weight and the time needed to achieve it.`,goalWeight:`Target weight`,goalWeightPlaceholder:`Example: 80`,duration:`Target duration`,durationPlaceholder:`Select duration`,month:`months`,back:`Back`,next:`Next`},identity:{defaultName:`User Name`,notLoggedIn:`Not logged in`,emailUnavailable:`Email unavailable`},wizardButtons:{finish:`Finish ✓`,next:`Next →`},photo:{fileNotSelected:`No File Selected`,selectImage:`Please select an image file first.`,updateSuccess:`Profile photo updated successfully.`,updateFailed:`Failed to update the profile photo. Please try another photo.`,failed:`Failed`},reset:{title:`Reset All Data?`,message:`Your profile, food history, and nutrition targets will be deleted from this device and the cloud. Your Google account will remain signed in.`,confirm:`Yes, Reset`,cancel:`Cancel`,successTitle:`Reset Successful`,successMessage:`All user data has been successfully deleted. Your Google account remains signed in.`,failedTitle:`Reset Failed`,failedMessage:`Some cloud data could not be deleted. Your local data has been kept. Check your internet connection and Firestore permissions, then try again.`},validation:{incompleteTitle:`Incomplete Data`,incompleteMessage:`Please complete your profile information.`,invalidNumberTitle:`Enter valid numbers`,invalidNumberMessage:`The entered data is invalid.`},saveMessages:{success:`Profile saved successfully.`,failed:`Failed to save profile.`},simulation:{title:`Weight Goal Simulation`,message:`Complete your profile to view the simulation.`,currentWeight:`Current weight`,goalWeight:`Target weight`,weightDifference:`Weight difference`,duration:`Target duration`,energyNeeds:`Energy Requirements`,bmr:`BMR`,tdee:`TDEE`,calorieSimulation:`Calorie Simulation`,weeklyChange:`Weekly weight change`,dailyAdjustment:`Daily deficit / surplus`,dailyCalorieTarget:`Daily calorie intake target`,infoButton:`BMR & TDEE Information`,infoButtonLabel:`BMR and TDEE Information`,invalidData:`Complete your profile, target weight, and target duration to view the simulation.`,invalidActivity:`Invalid activity selection.`,maintenance:`Maintenance`,noChange:`No change`,decrease:`Decrease`,increase:`Increase`,realistic:`Realistic`,aggressive:`Aggressive`,notRecommended:`Not recommended`,deficit:`Deficit`,surplus:`Surplus`,warningAggressiveLoss:`This is an aggressive target. Consider regular monitoring and evaluation.`,warningFastLoss:`The weight-loss target is too fast. Consider reviewing the duration with a healthcare professional.`,warningAggressiveGain:`This is an aggressive weight-gain target. Monitor your weight and physical condition regularly.`,warningFastGain:`The weight-gain target is too fast. Consider reviewing the target duration.`,warningInvalidCalories:`The calorie target is not suitable as an intake guideline. Review the target and duration.`,warningBelowBmr:`The estimated calorie target is below BMR. Do not apply it without consulting a healthcare professional.`,month:`months`,kcalPerDay:`kcal/day`,simulationMessage:`Simulation based on your profile data.`},info:{close:`Close information`,title:`Understanding BMR and TDEE`,bmrTitle:`1. BMR (Basal Metabolic Rate)`,bmrDescription:`BMR is the number of calories your body needs at rest to perform basic functions, such as breathing, pumping blood, regulating body temperature, and maintaining organ functions.`,tdeeTitle:`2. TDEE (Total Daily Energy Expenditure)`,tdeeDescription:`TDEE is the estimated total number of calories your body burns in a day, including daily activities and exercise.`,exampleTitle:`Calculation example`,bmrExample:`BMR: 1,800 kcal/day`,activityExample:`Activity factor: 1.55`,tdeeExample:`TDEE: 1,800 × 1.55 = 2,790 kcal/day`,relationshipTitle:`3. Relationship with body weight`,maintain:`Calories equal to TDEE: help maintain body weight.`,deficit:`Calories below TDEE: create an energy deficit.`,surplus:`Calories above TDEE: create an energy surplus.`,note:`BMR and TDEE values are estimates. Actual energy needs may vary from person to person.`},nutrition:{title:`Daily Targets`,calories:`Calorie Target`,protein:`Protein Target`,carbs:`Carbohydrate Target`,fat:`Fat Target`,kcal:`kcal`,gram:`grams`,note:`Nutrition targets are automatically calculated based on your body measurements, daily activity, and weight goal.`},actions:{save:`Save Profile`,reset:`Reset All Data`}},identity:{uploadPhoto:`Upload profile photo`,changePhoto:`Click to change profile photo`,photoAlt:`Profile photo`,defaultName:`User Name`,logout:`Log Out`,logoutTitle:`Log out of KaloriKu?`,logoutMessage:`Are you sure you want to log out? Local KaloriKu data on this device will be deleted.`,logoutCancel:`Cancel`,logoutConfirm:`Yes, Log Out`},modal:{success:`Success`,error:`An Error Occurred`,warning:`Warning`,info:`Information`,confirmation:`Confirmation`,yes:`Yes`,cancel:`Cancel`,ok:`OK`},navigation:{home:`Home`,history:`History`,statistics:`Statistics`,profile:`Profile`},footer:{copyright:`KaloriKu © 2026`,disclaimer:`Calculation results are estimates.`},appModal:{title:`Information`,cancel:`Cancel`,confirm:`OK`},onboarding:{slides:{welcomeTitle:`A healthier life starts here.`,welcomeDescription:`Understand your eating habits, track nutrition, and reach your health goals with KaloriKu.`,foodTitle:`Track your meals easily.`,foodDescription:`Save the foods you eat and discover their nutritional information.`,aiTitle:`Recognize food with AI.`,aiDescription:`Take a food photo and let AI help identify the food and estimate its portion.`,goalTitle:`Track your health progress.`,goalDescription:`Set calorie and nutrition goals, then monitor your progress every day.`,next:`Continue`,back:`Back`,skip:`Skip`,start:`Get Started`,slide:`Slide`},tour:{calorieTitle:`Track your daily calories`,calorieDescription:`See how many calories you have consumed, your daily target, and how many calories remain.`,nutritionTitle:`Understand your nutrition`,nutritionDescription:`Track protein, carbohydrates, fat, and water to understand your daily nutritional balance.`,scanTitle:`Track your meals easily`,scanDescription:`Use AI to recognize food from a photo, or enter food manually to calculate its nutrition.`,historyTitle:`View your food history`,historyDescription:`All the meals you have recorded can be reviewed on your history page.`,statisticsTitle:`Monitor your progress`,statisticsDescription:`View charts and calorie summaries to understand how your eating habits are developing.`,profileTitle:`Set up your profile and goals`,profileDescription:`Complete your body information and set daily calorie and nutrition targets based on your needs.`,step:`Step`,of:`of`,next:`Continue`,back:`Back`,finish:`Finish`,skip:`Skip`}}}}})),y=r((()=>{v();var e=`app_language`,t=localStorage.getItem(e)||`id`;_[t]||(t=`id`);function n(){return t}function r(e){return e.split(`.`).reduce((e,t)=>e?.[t],_[t])??e}function i(n){_[n]&&(t=n,localStorage.setItem(e,n),a(),window.dispatchEvent(new CustomEvent(`languageChanged`,{detail:{language:n}})))}function a(e=document){e.querySelectorAll(`[data-i18n]`).forEach(e=>{e.textContent=r(e.dataset.i18n)}),e.querySelectorAll(`[data-i18n-placeholder]`).forEach(e=>{e.placeholder=r(e.dataset.i18nPlaceholder)}),e.querySelectorAll(`[data-i18n-title]`).forEach(e=>{e.title=r(e.dataset.i18nTitle)}),e.querySelectorAll(`[data-i18n-aria-label]`).forEach(e=>{e.setAttribute(`aria-label`,r(e.dataset.i18nAriaLabel))}),e.querySelectorAll(`[data-i18n-alt]`).forEach(e=>{e.alt=r(e.dataset.i18nAlt)})}function o(){a()}window.getLanguage=n,window.t=r,window.setLanguage=i,window.applyTranslations=a,window.initializeLanguage=o;function s(){o();let e=document.getElementById(`languageSelect`);e&&(e.value=t,e.addEventListener(`change`,()=>{i(e.value)}))}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,s):s()})),b=r((()=>{i(),t(),document.documentElement.style.visibility=`hidden`;function n(){document.documentElement.style.visibility=`visible`}function r(){window.location.replace(`./login.html`)}function a(e,t){let n={ready:!0,type:e,user:t};window.__kalorikuAuthState=n,window.dispatchEvent(new CustomEvent(`kaloriku:authready`,{detail:n}))}var s={};try{s=JSON.parse(localStorage.getItem(`kaloriku_user`)||`{}`)}catch(e){console.error(`Data pengguna tidak valid:`,e)}s.uid===`guest`&&s.loginMethod===`guest`?(n(),a(`guest`,s)):e(o,e=>{if(e){let t={uid:e.uid,name:e.displayName||``,email:e.email||``,photo:e.photoURL||``,loginMethod:`google`};localStorage.setItem(`kaloriku_user`,JSON.stringify(t)),n(),a(`google`,t)}else r()},e=>{console.error(`Pemeriksaan sesi gagal:`,e),r()})}));function x({mode:e=`edit`,food:t=null,pangankuFoods:n,findFoodSuggestions:r,onSave:i,onDelete:a}){let o=e=>window.t?.(`foodEditModal.${e}`)??e,s=e===`edit`,c=t?t.originalName||t.name:``,l=s?Object.keys(n).find(e=>e===t.name):``,u=l?n[l]:null,d=document.createElement(`div`);d.className=`food-edit-overlay`;let f=document.createElement(`div`);f.className=`food-edit-modal`,f.innerHTML=`
    <div class="food-edit-header">
      <h3>${o(s?`editTitle`:`addTitle`)}</h3>
      <button type="button" class="food-edit-close">&times;</button>
    </div>

    <div class="food-edit-body">
      <label for="editFoodName">${o(`foodName`)}</label>

      <input
        type="text"
        id="editFoodName"
        placeholder="${o(`foodNamePlaceholder`)}"
        autocomplete="off"
      >

      <div class="food-edit-suggestions"></div>

      <label for="editFoodWeight">${o(`foodWeight`)}</label>

      <div class="food-edit-weight">
        <input
          type="number"
          id="editFoodWeight"
          min="1"
          step="1"
          placeholder="${o(`weightPlaceholder`)}"
        >
        <span>${o(`gram`)}</span>
      </div>

      <p class="food-edit-hint">
        ${o(`hint`)}
      </p>
    </div>

    <div class="food-edit-footer">
      ${s?`
        <button type="button" class="food-edit-delete">
          ${o(`delete`)}
        </button>
      `:``}

      <button type="button" class="food-edit-cancel">
        ${o(`cancel`)}
      </button>

      <button type="button" class="food-edit-save" disabled>
        ${o(s?`saveChanges`:`addFood`)}
      </button>
    </div>
  `,d.appendChild(f),document.body.appendChild(d);let p=f.querySelector(`#editFoodName`),m=f.querySelector(`#editFoodWeight`),h=f.querySelector(`.food-edit-suggestions`),g=f.querySelector(`.food-edit-save`),_=null;p.value=l||t?.name||``,m.value=Number(t?.estimatedWeight)||100;function v(){let e=Number(m.value);g.disabled=!(u&&l&&Number.isFinite(e)&&e>0)}function y(e){h.innerHTML=``;let t=e.trim();if(!t)return;let i=r(t,n,10);if(i.length)i.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.className=`food-edit-option`,t.textContent=`${e.name} — ${e.food.kcal??`—`} ${o(`calories`)} / ${o(`per100g`)}`,t.addEventListener(`click`,()=>{clearTimeout(_),u=e.food,l=e.name,p.value=e.name,h.innerHTML=``;let t=document.createElement(`p`);t.className=`food-edit-selected`,t.textContent=`${o(`selected`)} ${e.name}`,h.appendChild(t),v()}),h.appendChild(t)});else{let e=document.createElement(`p`);e.className=`food-edit-no-result`,e.textContent=o(`notFound`),h.appendChild(e)}}p.addEventListener(`input`,()=>{u=null,l=``,clearTimeout(_),h.innerHTML=``,v(),p.value.trim()&&(_=setTimeout(()=>{y(p.value)},500))}),p.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),clearTimeout(_),y(p.value))}),m.addEventListener(`input`,v),u||y(p.value);function b(){clearTimeout(_),d.remove()}f.querySelector(`.food-edit-close`).addEventListener(`click`,b),f.querySelector(`.food-edit-cancel`).addEventListener(`click`,b),d.addEventListener(`click`,e=>{e.target===d&&b()}),s&&f.querySelector(`.food-edit-delete`).addEventListener(`click`,async()=>{await window.confirmAppModal({type:`warning`,title:o(`delete`),message:`${o(`confirmDelete`)} "${t.name}" ${o(`fromAnalysis`)}`,confirmText:o(`yes`),cancelText:o(`cancel`)})&&(typeof a==`function`&&a(t),b())}),g.addEventListener(`click`,()=>{let e=Number(m.value);!u||!l||!Number.isFinite(e)||e<=0||(typeof i==`function`&&i({food:t,originalName:c,selectedFoodName:l,weight:e}),b())}),v()}var S=a((()=>{}));function C(e){return String(e||``).normalize(`NFKD`).replace(/[\u0300-\u036f]/g,``).toLowerCase().trim().replace(/&/g,` dan `).replace(/[,.]/g,` `).replace(/[-_/]/g,` `).replace(/[^\p{L}\p{N}\s]/gu,` `).replace(/\s+/g,` `).trim()}function w(e){let t=new Set,n=String(e||``).split(`,`).map(e=>C(e)).filter(Boolean);if(n.length<=1)return[];n.forEach(e=>t.add(e));let r=new Set;for(let e of n){let t=e.split(` `),n=t.findIndex(e=>ge.includes(e));n>0?r.add(t.slice(0,n).join(` `)):t.length>1&&r.add(t.slice(0,-1).join(` `))}for(let e of n)if(!(e.split(` `).length>2))for(let n of r)n&&!e.startsWith(n+` `)&&t.add(`${n} ${e}`);return[...t].filter(t=>t!==C(e))}function T(e){return e==null||e===``||!Number.isFinite(Number(e))?null:Number(e)}function E(e){if(!e)return null;let t=!!(e.nama&&e.nutrisi),n=t?e.nama:e.name,r=t?e.nutrisi:e;if(!n||!r)return null;let i=T(r.air_g);return{name:n,kcal:T(r.energi_kcal??r.energy_kcal),protein:T(r.protein_g),carbs:T(r.karbohidrat_g??r.carb_g),fat:T(r.lemak_g??r.fat_g),fiber:T(r.serat_g??r.fiber_g),sodium:T(r.natrium_mg??r.sodium_mg),water:i!==null&&i>=0?i:null,code:e.kode??e.code??null,source:e.sumber??e.source??`Panganku`,category:e.kategori??e.category??null,type:e.tipe??e.section??null,basis:e.basis??`100 g`,calcium:T(r.kalsium_mg??r.calcium_mg),phosphorus:T(r.fosfor_mg??r.phosphorus_mg),iron:T(r.besi_mg??r.iron_mg),potassium:T(r.kalium_mg??r.potassium_mg),copper:T(r.tembaga_mg??r.copper_mg),zinc:T(r.seng_mg??r.zinc_mg),retinol:T(r.retinol_mcg),beta_carotene:T(r.beta_karoten_mcg??r.beta_carotene_mcg),carotene_total:T(r.total_karoten_mcg??r.carotene_total_mcg),thiamin:T(r.tiamin_mg??r.thiamin_mg),riboflavin:T(r.riboflavin_mg),niacin:T(r.niasin_mg??r.niacin_mg),vitamin_c:T(r.vitamin_c_mg)}}function D(e){if(!e.nama||!e.nutrisi)return null;let t=e.nutrisi,n=T(t.air_g);return{name:e.nama,kcal:T(t.energi_kcal),protein:T(t.protein_g),carbs:T(t.karbohidrat_g),fat:T(t.lemak_g),fiber:T(t.serat_g),sodium:T(t.natrium_mg),water:n!==null&&n>=0?n:null,code:e.kode??null,source:e.sumber??`USDA`,category:e.kategori??null,type:e.tipe??null,basis:e.basis??`100 g`}}function O(){return new Promise((e,t)=>{if(!(`indexedDB`in globalThis)){t(Error(`IndexedDB tidak tersedia.`));return}let n=indexedDB.open(fe,1);n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(F)||e.createObjectStore(F)},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function k(){let e;try{return e=await O(),await new Promise((t,n)=>{let r=e.transaction(F,`readonly`).objectStore(F).get(`current`);r.onsuccess=()=>t(r.result||null),r.onerror=()=>n(r.error)})}catch(e){return console.warn(`Cache database tidak dapat dibaca:`,e),null}finally{e?.close()}}async function A(e){let t;try{t=await O(),await new Promise((n,r)=>{let i=t.transaction(F,`readwrite`);i.objectStore(F).put(e,`current`),i.oncomplete=()=>n(),i.onerror=()=>r(i.error),i.onabort=()=>r(i.error)})}catch(e){console.warn(`Database berhasil dimuat, tetapi cache gagal disimpan:`,e)}finally{t?.close()}}async function j(){let e=await fetch(pe,{cache:`no-store`});if(!e.ok)throw Error(`Manifest database tidak dapat diakses.`);let t=await e.json();if(!t||!Number.isInteger(t.databaseVersion)||!t.files?.panganku?.url||!t.files?.usda?.url||!t.files?.aliases?.url)throw Error(`Format manifest database tidak valid.`);return t}async function ee(){let e=await k(),t=null,n=!1,r,i,a;try{if(t=await j(),e&&e.databaseVersion===t.databaseVersion&&e.schemaVersion===t.schemaVersion&&e.database&&e.aliases)return P=e.aliases,console.log(`Database KaloriKu sudah versi terbaru:`,t.databaseVersion),e.database;let o=await Promise.all([fetch(t.files.panganku.url,{cache:`no-store`}),fetch(t.files.usda.url,{cache:`no-store`}),fetch(t.files.aliases.url,{cache:`no-store`})]);if(o.some(e=>!e.ok))throw Error(`Salah satu file database terbaru gagal diunduh.`);[r,i,a]=o,n=!0}catch(t){if(console.warn(`Pembaruan database online gagal:`,t),e?.database&&e?.aliases)return P=e.aliases,console.warn(`Menggunakan database cache versi:`,e.databaseVersion),e.database;let n=new URL(new URL(`panganku-nutrisi-BCFBasTC.json`,import.meta.url).href,``+import.meta.url),o=new URL(new URL(`usda_foundation_kaloriku-C0G-4thY.json`,import.meta.url).href,``+import.meta.url),s=new URL(new URL(`food-aliases-CpaaClmL.json`,import.meta.url).href,``+import.meta.url);[r,i,a]=await Promise.all([fetch(n),fetch(o),fetch(s)])}if(!r.ok)throw Error(`Database Panganku gagal dimuat.`);if(!i.ok)throw Error(`Database USDA gagal dimuat.`);if(!a.ok)throw Error(`File alias makanan gagal dimuat.`);let[o,s,c]=await Promise.all([r.json(),i.json(),a.json()]);if(!Array.isArray(o))throw Error(`Format database Panganku tidak valid.`);if(!Array.isArray(s))throw Error(`Format database USDA tidak valid.`);if(!c||typeof c!=`object`||Array.isArray(c))throw Error(`Format file food-aliases.json tidak valid.`);let l={},u={},d=0,f=0,p=0;function m(e,t,n){let r=C(e);r&&t&&(l[r]?p++:(l[r]=t,n===`Panganku`?(d++,w(e).forEach(e=>{!l[e]&&!u[e]&&(u[e]=r)})):n===`USDA`&&f++))}o.flat(1/0).forEach(e=>{let t=E(e);t&&m(t.name,t,`Panganku`)}),s.forEach(e=>{let t=D(e);t&&m(e.nama,t,`USDA`)});let h={};return Object.entries(u).forEach(([e,t])=>{l[t]&&!l[e]&&(h[e]=t)}),Object.entries(c).forEach(([e,t])=>{let n=C(e),r=C(t);n&&r&&l[r]&&(l[n]||(h[n]=t))}),P=h,await A({databaseVersion:n?t.databaseVersion:0,schemaVersion:n?t.schemaVersion:1,updatedAt:n?t.updatedAt??null:null,database:l,aliases:P}),console.log(`====================================`),console.log(`       DATABASE KALORIKU`),console.log(`====================================`),console.log(`Panganku :`,d),console.log(`USDA     :`,f),console.log(`------------------------------------`),console.log(`Total makanan unik :`,Object.keys(l).length),console.log(`Total duplikat     :`,p),console.log(`Total alias aktif  :`,Object.keys(P).length),console.log(`====================================`),l}function M(e,t=P){let n=C(e);if(!n||!t)return null;if(t[n])return t[n];let r=Object.keys(t).find(e=>C(e)===n);return r?t[r]:null}function te(e){let t=C(e);for(let[e,n]of Object.entries(he)){let r=RegExp(`\\b${e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}\\b`,`g`);t=t.replace(r,n)}return t.split(` `).filter(Boolean).map(e=>me[e]||e)}function N(e){return ge.includes(e)}function ne(e){return _e.includes(e)}function re(e){return ve.includes(e)}function ie(e){return[...new Set(e)]}function ae(e){return ie(te(e).filter(e=>!ye.includes(e)))}function oe(e){return e.filter(e=>!N(e)&&!ne(e)&&!re(e))}function se(e,t){let n=ae(e),r=ae(t);if(!n.length||!r.length)return 0;if(n.join(` `)===r.join(` `))return 100;let i=oe(n),a=oe(r),o=n.filter(N),s=r.filter(N);if(o.length&&s.length&&!o.some(e=>s.includes(e)))return 0;let c=i.filter(e=>a.includes(e));if(i.length&&c.length===0||i.length===0&&a.length>0)return 0;let l=i.length?c.length/i.length:0,u=a.length?c.length/a.length:0,d=n.filter(e=>r.includes(e)).length/n.length,f=0;if(o.length){let e=o.filter(e=>s.includes(e));f=e.length?e.length/o.length*15:-15}let p=n.filter(ne),m=r.filter(ne),h=0;p.length&&(h=p.filter(e=>m.includes(e)).length/p.length*10);let g=l*35+u*25+d*15+f+h,_=a.filter(e=>!i.includes(e));g-=_.length*5;let v=m.filter(e=>!n.includes(e));return g-=v.length*3,Math.max(0,Math.min(100,Math.round(g)))}function ce(e,t,n=P){let r=C(e);if(!r||!t)return[];if(t[r])return[{name:r,food:t[r],score:100,matchType:`exact`}];let i=M(r,n);if(i){let e=C(i);if(t[e])return[{name:e,food:t[e],score:100,matchType:`alias`}]}return Object.entries(t).map(([e,t])=>({name:e,food:t,score:se(r,e),matchType:`similar`})).filter(e=>e.score>=25).sort((e,t)=>t.score-e.score)}function le(e,t,n=P){let r=C(e);if(!r||!t)return null;if(t[r])return{name:r,food:t[r],score:100,matchType:`exact`};let i=M(r,n);if(i){let e=C(i);if(t[e])return{name:e,food:t[e],score:100,matchType:`alias`}}let a=ce(r,t,n);if(!a.length)return null;let o=a[0],s=a[1];return o.score<70||s&&o.score-s.score<8?null:o}function ue(e,t,n=P){let r=le(e,t,n);return r?r.food:null}function de(e,t){let n=t.map(t=>{let n=C(t.name),r=n;if(!e[r]){let e=M(n);e&&(r=C(e))}let i=e[r];if(!i)throw Error(`Bahan "${t.name}" tidak ditemukan.`);if(!Number.isFinite(t.weight)||t.weight<=0)throw Error(`Berat komposisi bahan tidak valid.`);return{name:r,weight:t.weight,food:i}}),r=n.reduce((e,t)=>e+t.weight,0),i=e=>n.map(t=>t.food[e]).some(e=>e==null||!Number.isFinite(e))?null:n.reduce((t,n)=>t+n.food[e]*n.weight/r,0);return{kcal:i(`kcal`),protein:i(`protein`),carbs:i(`carbs`),fat:i(`fat`),fiber:i(`fiber`),sodium:i(`sodium`),water:i(`water`),code:null,source:`Panganku - komposisi gabungan`,category:`Hidangan campuran`,type:`Gabungan`,basis:`100 g`,ingredients:n.map(e=>({name:e.name,proportion:e.weight/r*100}))}}var P,fe,F,pe,me,he,ge,_e,ve,ye,be=a((()=>{P={},fe=`kaloriku-food-database`,F=`snapshots`,pe=`https://raw.githubusercontent.com/rovixa-ai/KaloriSehat/main/database/manifest.json`,me={toge:`tauge`,taoge:`tauge`,telor:`telur`,digoreng:`goreng`,menggoreng:`goreng`,gorengan:`goreng`,dibakar:`bakar`,panggang:`bakar`,dipanggang:`bakar`,direbus:`rebus`,merebus:`rebus`,dikukus:`kukus`,ditumis:`tumis`,menumis:`tumis`,bertepung:`tepung`},he={"telur ceplok":`telur mata sapi`,"telor ceplok":`telur mata sapi`,"telor mata sapi":`telur mata sapi`,"ayam goreng crispy":`ayam goreng tepung`,"ayam crispy goreng":`ayam goreng tepung`,"kentang goreng french fries":`kentang goreng`},ge=[`goreng`,`bakar`,`rebus`,`kukus`,`tumis`,`pepes`],_e=[`tepung`,`santan`,`crispy`,`kering`,`basah`,`asin`,`manis`,`pedas`,`sambal`],ve=[`sayur`,`sayuran`,`masakan`,`makanan`,`hidangan`,`lauk`,`menu`],ye=[`dan`,`dengan`,`atau`,`yang`]}));function xe(){try{return JSON.parse(localStorage.getItem(`kaloriku_meals`)||`[]`)}catch(e){return console.error(`Gagal membaca data makanan:`,e),[]}}function Se(e){localStorage.setItem(`kaloriku_meals`,JSON.stringify(e))}function Ce(){try{let e=JSON.parse(localStorage.getItem(`kaloriku_profile`)||`{}`),t=Number(e.dailyCalorieTarget);return Number.isFinite(t)&&t>0?t:0}catch(e){return console.error(`Gagal membaca target kalori:`,e),0}}function we(){try{let e=JSON.parse(localStorage.getItem(`kaloriku_profile`)||`{}`);return{protein:Number(e.dailyProteinTarget)||0,carbs:Number(e.dailyCarbTarget)||0,fat:Number(e.dailyFatTarget)||0,water:Number(e.dailyWaterTarget)||2750}}catch(e){return console.error(`Gagal membaca target nutrisi:`,e),{protein:0,carbs:0,fat:0,water:2750}}}function Te(e){localStorage.setItem(`kaloriku_target`,e)}var Ee=a((()=>{}));function I(){let e=o.currentUser;if(!e)return null;try{let t=JSON.parse(localStorage.getItem(`kaloriku_user`)||`{}`);return t.loginMethod!==`google`||t.uid!==e.uid?null:e}catch(e){return console.error(`Gagal memeriksa akun:`,e),null}}function De(){return crypto.randomUUID()}function Oe(e){return`kaloriku_pending_meals_${e}`}function ke(e){return`kaloriku_sync_due_${e}`}function Ae(e){let t=Number(localStorage.getItem(ke(e)));return Number.isFinite(t)&&t>0?t:null}function je(e,t){localStorage.setItem(ke(e),String(t))}function Me(e){localStorage.removeItem(ke(e))}function Ne(e){try{return JSON.parse(localStorage.getItem(Oe(e))||`[]`)}catch(e){return console.error(`Gagal membaca antrean:`,e),[]}}function Pe(e,t){localStorage.setItem(Oe(e),JSON.stringify(t))}function Fe(e){let t=[`name`,`weight`,`kcal`,`protein`,`carbs`,`fat`,`fiber`,`sodium`,`water`,`source`,`code`],n={};return t.forEach(t=>{e[t]!==void 0&&(n[t]=e[t])}),n}function Ie(e){let t=[`id`,`name`,`weight`,`kcal`,`protein`,`carbs`,`fat`,`fiber`,`sodium`,`water`,`source`,`code`,`date`,`createdAt`,`foodCount`],n={};return t.forEach(t=>{e[t]!==void 0&&(n[t]=e[t])}),Array.isArray(e.foods)&&(n.foods=e.foods.map(Fe)),n}function Le(e){return`batch_${e[0].id}_${e[e.length-1].id}`.replaceAll(`/`,`_`)}async function Re(e){if(L||window.__kalorikuResetInProgress)return!1;let t=I();if(!t)throw Error(`Pengguna belum login dengan Google.`);if(!Array.isArray(e)||e.length===0||e.length>Ke)throw Error(`Jumlah catatan dalam batch tidak valid.`);let r=e.map(Ie);if(r.some(e=>!e.id)||new Set(r.map(e=>e.id)).size!==r.length)throw Error(`ID catatan tidak valid atau duplikat.`);let i=Le(r),a=l(n,`users`,t.uid,`scanBatches`,i);return L||window.__kalorikuResetInProgress?!1:(await p(a,{meals:r,updatedAt:f()}),console.log(`${r.length} catatan berhasil disimpan ke Firestore.`),!0)}async function ze(e=!1){if(L||window.__kalorikuResetInProgress)return;let t=I();if(t){if(z)return z;z=(async()=>{let n=t.uid;try{for(;!(L||window.__kalorikuResetInProgress||o.currentUser?.uid!==n);){let t=Ne(n);if(t.length===0||t.length<Ke&&!e)break;let r=t.slice(0,Ke);if(await Re(r),L||window.__kalorikuResetInProgress||o.currentUser?.uid!==n)break;let i=new Set(r.map(e=>e.id));Pe(n,Ne(n).filter(e=>!i.has(e.id))),console.log(`Antrean tersisa: ${Ne(n).length}`)}}catch(e){console.error(`Sinkronisasi gagal. Data tetap dalam antrean:`,e),o.currentUser?.uid===n&&!L&&!window.__kalorikuResetInProgress&&je(n,Date.now()+qe)}})();try{await z}finally{z=null;let e=I();e&&!L&&!window.__kalorikuResetInProgress&&Be(e.uid)}}}function Be(e){if(L||window.__kalorikuResetInProgress)return;clearTimeout(R),R=null;let t=Ne(e);if(t.length===0){Me(e);return}if(t.length>=Ke){Me(e),ze(!1);return}let n=Ae(e);n||(n=Date.now()+qe,je(e,n));let r=Math.max(0,n-Date.now());console.log(`Sinkronisasi dijadwalkan dalam:`,Math.ceil(r/1e3),`detik`),R=setTimeout(()=>{I()?.uid===e&&!L&&!window.__kalorikuResetInProgress&&ze(!0)},r)}async function Ve(e){if(L||window.__kalorikuResetInProgress)return!1;let t=I();if(!t||!Array.isArray(e)||e.length===0)return!1;let n=t.uid,r=Ne(n),i=new Set(r.map(e=>e.id));for(let t of e){if(!t.id)throw Error(`Catatan belum memiliki ID unik.`);i.has(t.id)||(r.push(Ie(t)),i.add(t.id))}return L||window.__kalorikuResetInProgress?!1:(Pe(n,r),console.log(`Antrean sinkronisasi: ${r.length} catatan.`),r.length>=Ke?(clearTimeout(R),R=null,await ze(!1)):Be(n),!0)}async function He(){if(L||window.__kalorikuResetInProgress)return!1;let e=I();if(!e)return!1;try{let t=e.uid,n=await We();if(L||window.__kalorikuResetInProgress||o.currentUser?.uid!==t)return!1;let r=xe(),i=new Map;n.forEach(e=>{e.id&&i.set(e.id,e)}),r.forEach(e=>{e.id&&i.set(e.id,e)});let a=Array.from(i.values());if(a.sort((e,t)=>Number(t.createdAt||0)-Number(e.createdAt||0)),L||window.__kalorikuResetInProgress)return!1;Se(a);let s=new Set(n.map(e=>e.id)),c=r.filter(e=>e.id&&!s.has(e.id));return c.length>0&&await Ve(c),console.log(`===== SINKRONISASI RIWAYAT =====`),console.log(`Data cloud:`,n.length),console.log(`Data lokal:`,r.length),console.log(`Data gabungan:`,a.length),console.log(`Belum tersinkron:`,c.length),console.log(`================================`),!0}catch(e){return console.error(`Gagal menggabungkan riwayat:`,e),!1}}function Ue(){Je||(Je=!0,h(o,e=>{clearTimeout(R),R=null,e&&I()&&!L&&!window.__kalorikuResetInProgress&&He().finally(()=>{let e=I();e&&!L&&!window.__kalorikuResetInProgress&&Be(e.uid)})}),window.addEventListener(`online`,()=>{I()&&!L&&!window.__kalorikuResetInProgress&&ze(!0)}))}async function We(){if(L||window.__kalorikuResetInProgress)return[];let e=I();if(!e)throw Error(`Pengguna belum login dengan Google.`);let t=s(n,`users`,e.uid,`scanBatches`),r=await d(t);if(L||window.__kalorikuResetInProgress)return[];let i=[];return r.forEach(e=>{let t=e.data();Array.isArray(t.meals)&&i.push(...t.meals)}),i.sort((e,t)=>Number(t.createdAt||0)-Number(e.createdAt||0)),i}async function Ge(){if(L)throw Error(`Reset riwayat makanan sedang berjalan.`);L=!0,clearTimeout(R),R=null;try{z&&await z,clearTimeout(R),R=null;let e=I();if(!e)throw Error(`Akun Google tidak ditemukan.`);let t=s(n,`users`,e.uid,`scanBatches`),r=(await d(t)).docs;for(let e=0;e<r.length;e+=450){let t=m(n);r.slice(e,e+450).forEach(e=>{t.delete(e.ref)}),await t.commit()}if(o.currentUser?.uid!==e.uid)throw Error(`Akun berubah selama proses reset.`);return localStorage.removeItem(Oe(e.uid)),localStorage.removeItem(ke(e.uid)),console.log(`${r.length} batch riwayat berhasil dihapus dari Firestore.`),!0}catch(e){throw console.error(`Gagal menghapus riwayat makanan Firestore:`,e),e}finally{L=!1}}var Ke,qe,L,R,z,Je,Ye=a((()=>{i(),Ee(),Ke=10,qe=6e4,L=!1,R=null,z=null,Je=!1}));function Xe(){return new Date().toLocaleDateString(`sv-SE`)}function Ze(){let e=xe(),t=Xe();return e.filter(e=>e.date===t)}function Qe(e){return e.reduce((e,t)=>(e.kcal+=Number(t.kcal)||0,e.protein+=Number(t.protein)||0,e.carbs+=Number(t.carbs)||0,e.fat+=Number(t.fat)||0,e.water+=Number(t.water)||0,e),{kcal:0,protein:0,carbs:0,fat:0,water:0})}function $e(){let e=Ze(),t=Qe(e),n=Ce();return{meals:e,total:t,target:n,remaining:Math.max(0,n-t.kcal)}}var et=a((()=>{Ee()}));function tt(e){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function nt(e,t,n=``,r=0,i=!1){if(!e)return;let a=Number(t)||0,o=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,s=lt.get(e);s&&(cancelAnimationFrame(s),lt.delete(e));let c=Number(e.dataset.currentValue),l=i?0:Number.isFinite(c)?c:0;if(i&&(e.dataset.currentValue=0,e.textContent=0 .toFixed(r)+n),o||l===a){e.textContent=a.toFixed(r)+n,e.dataset.currentValue=a;return}let u=performance.now();function d(t){let i=t-u,o=Math.min(i/750,1),s=1-(1-o)**3,c=l+(a-l)*s;if(e.dataset.currentValue=c,e.textContent=c.toFixed(r)+n,o<1){let t=requestAnimationFrame(d);lt.set(e,t)}else e.textContent=a.toFixed(r)+n,e.dataset.currentValue=a,lt.delete(e)}let f=requestAnimationFrame(d);lt.set(e,f)}function rt(){let e=B(`today`);e&&(e.textContent=new Date().toLocaleDateString(`id-ID`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`}))}function it(e){let t=B(`historyList`);t&&(t.innerHTML=!e||!e.length?`<div class="empty-history">Belum ada makanan hari ini.</div>`:e.map(e=>Array.isArray(e.foods)?`
        <div class="history-item">
          <div>
            <b>${tt(e.name)}</b>
            <div>${e.foodCount||e.foods.length} jenis makanan</div>
            <div class="history-food-details">
              ${e.foods.map(e=>`
                <div>
                  ${tt(e.name)}
                  (${Number(e.weight)||0} g)
                </div>
              `).join(``)}
            </div>
          </div>
          <strong>${Math.round(Number(e.kcal)||0)} kkal</strong>
        </div>
      `:`
      <div class="history-item">
        <div>
          <b>${tt(e.name)}</b>
          <div>${Number(e.weight)||0} gram</div>
        </div>
        <strong>${Math.round(Number(e.kcal)||0)} kkal</strong>
      </div>
    `).join(``))}function at(e,t,n,r=!1){let i=B(e);if(!i)return;let a=i.querySelector(`.ring-fill`),o=i.querySelector(`.ring-percent`);if(!a||!o)return;let s=Math.max(0,Number(t)||0),c=Math.max(0,Number(n)||0),l=c>0?Math.min(100,s/c*100):0,u=2*Math.PI*42;a.style.strokeDasharray=u;let d=u-l/100*u;r?(a.style.transition=`none`,a.style.strokeDashoffset=u,a.getBoundingClientRect(),requestAnimationFrame(()=>{requestAnimationFrame(()=>{a.style.transition=`stroke-dashoffset 1200ms cubic-bezier(0.22, 1, 0.36, 1)`,a.style.strokeDashoffset=d})})):a.style.strokeDashoffset=d,i.setAttribute(`role`,`progressbar`),i.setAttribute(`aria-valuemin`,`0`),i.setAttribute(`aria-valuemax`,`100`),i.setAttribute(`aria-valuenow`,Math.round(l)),i.dataset.progress=Math.round(l),i.dataset.reached=l>=100?`true`:`false`,nt(o,Math.round(l),`%`,0,r)}function ot(e=!1){let{meals:t,total:n,target:r,remaining:i}=$e(),a=we(),o=Number(n.kcal)||0,s=Number(n.protein)||0,c=Number(n.carbs)||0,l=Number(n.fat)||0,u=Number(n.water)||0,d=Number(r)||0,f=Number(i)||0,p=Number(a.protein)||0,m=Number(a.carbs)||0,h=Number(a.fat)||0,g=Number(a.water)||0;nt(B(`totalCalories`),Math.round(o),``,0,e),B(`targetText`)&&(B(`targetText`).textContent=Math.round(d)),nt(B(`remainingCalories`),Math.round(f),``,0,e);let _=d>0?Math.min(100,Math.max(0,o/d*100)):0,v=B(`progressBar`);v&&(e?(v.style.transition=`none`,v.style.width=`0%`,v.getBoundingClientRect(),requestAnimationFrame(()=>{requestAnimationFrame(()=>{v.style.transition=`width 900ms cubic-bezier(0.22, 1, 0.36, 1)`,v.style.width=_+`%`})})):v.style.width=_+`%`,v.setAttribute(`aria-valuenow`,Math.round(_)),v.setAttribute(`aria-valuemin`,`0`),v.setAttribute(`aria-valuemax`,`100`),v.dataset.reached=_>=100?`true`:`false`),nt(B(`totalProtein`),s,` g`,1,e),nt(B(`totalCarbs`),c,` g`,1,e),nt(B(`totalFat`),l,` g`,1,e),nt(B(`totalWater`),u,` ml`,0,e),B(`proteinTargetText`)&&(B(`proteinTargetText`).textContent=p),B(`carbsTargetText`)&&(B(`carbsTargetText`).textContent=m),B(`fatTargetText`)&&(B(`fatTargetText`).textContent=h),B(`waterTargetText`)&&(B(`waterTargetText`).textContent=Math.round(g)),at(`proteinProgress`,s,p,e),at(`carbsProgress`,c,m,e),at(`fatProgress`,l,h,e),at(`waterProgress`,u,g,e),it(t)}function st(){let e=B(`editTarget`);e&&e.dataset.initialized!==`true`&&(e.dataset.initialized=`true`,e.addEventListener(`click`,()=>{let e=prompt(`Masukkan target kalori harian:`,Ce());if(e===null)return;let t=Number(e);!Number.isFinite(t)||t<=0?showAppModal({type:`warning`,title:`Error`,message:`Target harus berupa angka positif.`}):(Te(t),ot())}))}function ct(){rt(),st(),ot(),window.addEventListener(`profileTargetUpdated`,ot)}var B,lt,ut=a((()=>{et(),Ee(),B=e=>document.getElementById(e),lt=new Map,document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,ct,{once:!0}):ct(),document.addEventListener(`kaloriku:pagechange`,e=>{e.detail?.pageId===`homePage`&&requestAnimationFrame(()=>{ot(!0)})})}));async function dt(e){let t=await createImageBitmap(e),n=Math.min(1,1280/Math.max(t.width,t.height)),r=document.createElement(`canvas`);r.width=Math.round(t.width*n),r.height=Math.round(t.height*n),r.getContext(`2d`).drawImage(t,0,0,r.width,r.height),t.close();let i=await new Promise(e=>{r.toBlob(e,`image/jpeg`,.75)});if(!i)throw Error(`Gagal mengompresi foto.`);return i.size>=e.size?e:new File([i],`food-photo.jpg`,{type:`image/jpeg`,lastModified:Date.now()})}async function ft(e,t=()=>{}){if(!e)throw Error(`Pilih foto makanan terlebih dahulu.`);t(`preparing`);let n=await dt(e),r=new FormData;r.append(`photo`,n),t(`recognizing`);let i=await fetch(`${pt}/analyze-food`,{method:`POST`,body:r}),a;try{a=await i.json()}catch{throw Error(`Respons backend tidak valid.`)}if(!i.ok)throw Error(a.error||`Gagal menganalisis foto.`);if(!Array.isArray(a.foods)||a.foods.length===0)throw Error(`Tidak menemukan makanan.`);return a.foods}var pt,mt=a((()=>{pt=`https://kalori-sehat.vercel.app`}));function ht(){try{return`kaloriku_food_edit_tour_v1_${JSON.parse(localStorage.getItem(`kaloriku_user`)||`{}`).uid||`guest`}`}catch{return`kaloriku_food_edit_tour_v1_guest`}}function gt(){return localStorage.getItem(ht())===`true`}function _t(){localStorage.setItem(ht(),`true`)}function vt(){return window.getLanguage?.()||`id`}function yt(e){let t={id:{editTitle:`Edit makanan`,editDescription:`Tekan tombol Edit untuk mengubah nama makanan dan berat porsinya.`,nameTitle:`Ubah nama makanan`,nameDescription:`Kamu bisa mengganti nama makanan. Ketik nama baru, lalu pilih rekomendasi yang sesuai dari database KaloriKu.`,weightTitle:`Atur berat makanan`,weightDescription:`Masukkan berat makanan dalam gram. Perhitungan kalori dan nutrisi akan menyesuaikan berat ini.`,saveTitle:`Simpan perubahan`,saveDescription:`Setelah memilih makanan dan mengatur beratnya, tekan Simpan Perubahan untuk memperbarui hasil nutrisi.`,step:`Langkah`,of:`dari`,next:`Lanjutkan`,open:`Coba Edit`,finish:`Selesai`,skip:`Lewati`},en:{editTitle:`Edit your food`,editDescription:`Press Edit to change the food name and serving weight.`,nameTitle:`Change food name`,nameDescription:`You can change the food name. Type a new name and select a matching suggestion from the KaloriKu database.`,weightTitle:`Adjust food weight`,weightDescription:`Enter the food weight in grams. Calories and nutrition will adjust automatically.`,saveTitle:`Save your changes`,saveDescription:`After selecting the food and setting its weight, press Save Changes to update the nutrition results.`,step:`Step`,of:`of`,next:`Continue`,open:`Try Editing`,finish:`Finish`,skip:`Skip`}};return t[vt()]?.[e]||t.id[e]||e}function bt(){if(document.getElementById(`food-edit-tour-styles`))return;let e=document.createElement(`style`);e.id=`food-edit-tour-styles`,e.textContent=`
    .food-edit-tour-overlay {
      position: fixed;
      inset: 0;
      z-index: 200000;
      pointer-events: none;
    }

    .food-edit-tour-highlight {
      position: fixed;
      border: 2px solid #16a085;
      border-radius: 12px;
      box-shadow:
        0 0 0 9999px rgba(10, 15, 25, .68),
        0 0 24px rgba(22, 160, 133, .28);
      pointer-events: none;
      transition:
        top .25s ease,
        left .25s ease,
        width .25s ease,
        height .25s ease;
    }

    .food-edit-tour-tooltip {
      position: fixed;
      width: min(340px, calc(100vw - 32px));
      padding: 19px;
      background: var(--card-bg, #fff);
      color: var(--text-color, #20252d);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 17px;
      box-shadow: 0 14px 45px rgba(0,0,0,.22);
      pointer-events: auto;
      z-index: 200001;
      font-family: inherit;
    }

    .food-edit-tour-progress {
      font-size: 11px;
      font-weight: 700;
      color: #16a085;
      margin-bottom: 9px;
      letter-spacing: .5px;
    }

    .food-edit-tour-tooltip h3 {
      font-size: 17px;
      margin: 0 0 9px;
      font-weight: 700;
    }

    .food-edit-tour-tooltip p {
      font-size: 13px;
      line-height: 1.65;
      margin: 0;
      opacity: .8;
    }

    .food-edit-tour-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 19px;
    }

    .food-edit-tour-actions button {
      border: 0;
      border-radius: 9px;
      padding: 10px 15px;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .food-edit-tour-skip {
      background: transparent;
      color: inherit;
      opacity: .65;
    }

    .food-edit-tour-next {
      background: #16a085;
      color: white;
    }

    @media (max-width: 480px) {
      .food-edit-tour-tooltip {
        padding: 16px;
      }
    }
  `,document.head.appendChild(e)}async function xt(){if(St||gt())return;let e=document.querySelector(`[data-food-edit-tour="trigger"]`);if(!e)return;St=!0,bt();let t=document.createElement(`div`);t.className=`food-edit-tour-overlay`;let n=document.createElement(`div`);n.className=`food-edit-tour-highlight`;let r=document.createElement(`div`);r.className=`food-edit-tour-tooltip`,t.append(n,r),document.body.appendChild(t);let i=null,a=!1,o=[{selector:`[data-food-edit-tour="trigger"]`,title:`editTitle`,description:`editDescription`,button:`open`},{selector:`#editFoodName`,title:`nameTitle`,description:`nameDescription`,button:`next`},{selector:`#editFoodWeight`,title:`weightTitle`,description:`weightDescription`,button:`next`},{selector:`.food-edit-save`,title:`saveTitle`,description:`saveDescription`,button:`finish`}];function s(){a||(a=!0,_t(),t.remove(),window.removeEventListener(`resize`,c),window.removeEventListener(`scroll`,c,!0),document.removeEventListener(`click`,l,!0),document.removeEventListener(`keydown`,u),St=!1)}function c(){if(!i||!i.isConnected)return;let e=i.getBoundingClientRect();n.style.top=`${e.top-5}px`,n.style.left=`${e.left-5}px`,n.style.width=`${e.width+10}px`,n.style.height=`${e.height+10}px`;let t=Math.min(340,window.innerWidth-32),a=Math.max(16,Math.min(e.left,window.innerWidth-t-16)),o=e.bottom+16;o+r.offsetHeight>window.innerHeight-16&&(o=e.top-r.offsetHeight-16),o=Math.max(12,Math.min(o,window.innerHeight-r.offsetHeight-12)),r.style.left=`${a}px`,r.style.top=`${o}px`}function l(e){(e.target.closest?.(`.food-edit-close, .food-edit-cancel`)||e.target.classList?.contains(`food-edit-overlay`))&&s()}function u(e){e.key===`Escape`&&s()}function d(e,t=30){return new Promise(n=>{let r=0;function i(){let a=document.querySelector(e);a&&a.getClientRects().length?n(a):++r>=t?n(null):setTimeout(i,100)}i()})}async function f(t){if(a)return;let n=o[t],l=await d(n.selector);if(!l){s();return}i=l,l.scrollIntoView({behavior:`smooth`,block:`center`}),r.innerHTML=`
      <div class="food-edit-tour-progress">
        ${yt(`step`)} ${t+1} ${yt(`of`)} ${o.length}
      </div>

      <h3>${yt(n.title)}</h3>

      <p>${yt(n.description)}</p>

      <div class="food-edit-tour-actions">
        <button type="button" class="food-edit-tour-skip">
          ${yt(`skip`)}
        </button>

        <button type="button" class="food-edit-tour-next">
          ${yt(n.button)}
        </button>
      </div>
    `;let u=r.querySelector(`.food-edit-tour-next`);r.querySelector(`.food-edit-tour-skip`).addEventListener(`click`,s),u.addEventListener(`click`,async()=>{t===0?(e.click(),await f(1)):t===o.length-1?s():await f(t+1)}),requestAnimationFrame(c)}window.addEventListener(`resize`,c),window.addEventListener(`scroll`,c,!0),document.addEventListener(`click`,l,!0),document.addEventListener(`keydown`,u),await f(0)}var St,Ct=a((()=>{St=!1})),wt=r((()=>{S(),be(),Ee(),Ye(),ut(),mt(),Ct();var e=e=>document.getElementById(e),t=e=>window.t?.(`foodScanner.${e}`)??e;Ue();var n=null,r=null,i={},a=null,o=null,s=``,c=null,l=0;function u(n=``,r=null){s=n,c=r;let i=e(`analysisStatus`);if(!i)return;if(!n||n===`error`){i.hidden=!0,n===`error`&&showAppModal({type:`error`,title:t(`analysisError`),message:r||t(`analysisError`)});return}let a={preparing:{step:1,progress:8,title:`preparingPhoto`,subtitle:`preparingPhotoDescription`},recognizing:{step:2,progress:30,title:`recognizingFood`,subtitle:`recognizingFoodDescription`},identifying:{step:3,progress:52,title:`identifyingComposition`,subtitle:`identifyingCompositionDescription`},calculating:{step:4,progress:75,title:`calculatingNutrition`,subtitle:`calculatingNutritionDescription`},preparingResults:{step:5,progress:92,title:`preparingResults`,subtitle:`preparingResultsDescription`},complete:{step:5,progress:100,title:`analysisComplete`,subtitle:`analysisCompleteDescription`}}[n];a&&(i.hidden=!1,e(`analysisStageTitle`).textContent=t(a.title),e(`analysisStageSubtitle`).textContent=t(a.subtitle),e(`analysisProgressBar`).style.width=`${a.progress}%`,i.querySelectorAll(`.analysis-step`).forEach(e=>{let t=Number(e.dataset.step);e.classList.toggle(`is-active`,t===a.step&&n!==`complete`),e.classList.toggle(`is-complete`,t<a.step||n===`complete`)}),n===`complete`&&setTimeout(()=>{i.hidden=!0},1100))}function d(){e(`foodPhoto`).value=``,a&&=(URL.revokeObjectURL(a),null),e(`preview`).src=``,e(`preview`).hidden=!0,e(`analyzeButton`).disabled=!0,u(),e(`analysisResults`).hidden=!0,e(`detectedFoods`).innerHTML=``,e(`foodName`).value=``,e(`foodWeight`).value=100,e(`result`).hidden=!0,e(`resultDetails`).textContent=``,e(`foodSuggestions`).hidden=!0,e(`suggestionList`).innerHTML=``,n=null,r=null,o=null,l++}var f=ee().then(e=>(i=e,i[`tumis buncis dan wortel`]=de(i,[{name:`buncis tumis`,weight:50},{name:`wortel tumis`,weight:50}]),console.log(`Database Panganku berhasil dimuat:`,Object.keys(i).length,`makanan`),i)).catch(e=>{throw console.error(`Gagal memuat Panganku:`,e),e});function p(){try{let e=JSON.parse(localStorage.getItem(`kaloriku_food_aliases`)||`{}`);return{...P,...e}}catch{return P}}function m(e,t){try{let n=JSON.parse(localStorage.getItem(`kaloriku_food_aliases`)||`{}`);n[e]=t,localStorage.setItem(`kaloriku_food_aliases`,JSON.stringify(n))}catch(e){console.error(`Gagal menyimpan alias makanan:`,e)}}function h(e){return String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}e(`foodPhoto`).addEventListener(`change`,n=>{let r=n.target.files[0];r&&(r.type.startsWith(`image/`)?(a&&URL.revokeObjectURL(a),a=URL.createObjectURL(r),e(`preview`).src=a,e(`preview`).hidden=!1,e(`analyzeButton`).disabled=!1,u(),e(`analysisResults`).hidden=!0,e(`detectedFoods`).innerHTML=``,o=null):(showAppModal({type:`warning`,title:t(`fileNotSelected`),message:t(`selectImageFirst`)}),n.target.value=``))}),e(`analyzeButton`).addEventListener(`click`,async()=>{let n=e(`foodPhoto`).files[0];if(!n)showAppModal({type:`warning`,title:t(`fileNotSelected`),message:t(`selectFoodPhoto`)});else{e(`analyzeButton`).disabled=!0,e(`analysisResults`).hidden=!0;try{let r=await ft(n,e=>{u(e)});if(!Array.isArray(r)||!r.length)throw Error(t(`analysisError`));u(`identifying`),await A(r),u(`preparingResults`),e(`analysisResults`).hidden=!1,u(`complete`)}catch(e){console.error(e),u(`error`,e.message||t(`analysisError`))}finally{e(`analyzeButton`).disabled=!1}}});var g=`https://kalori-sehat.vercel.app`,_=`kaloriku_ai_food_cache`,v=2592e6,y=new Map,b=new Map;function C(e){return String(e||``).normalize(`NFKD`).replace(/[\u0300-\u036f]/g,``).toLowerCase().trim().replace(/&/g,` dan `).replace(/[.,;:()[\]{}'"`]/g,` `).replace(/[-/\\]/g,` `).replace(/[^\p{L}\p{N}\s]/gu,` `).replace(/\s+/g,` `).trim()}function w(){try{return JSON.parse(localStorage.getItem(_)||`{}`)}catch{return{}}}function T(e,t){try{let n=w(),r=C(e);n[r]={...t,cachedAt:Date.now()},localStorage.setItem(_,JSON.stringify(n))}catch(e){console.warn(`Gagal menyimpan cache nutrisi AI:`,e)}}function E(e,t){if(!e)return null;let n={name:e.name||t,kcal:Number(e.kcal),protein:Number(e.protein),carbs:Number(e.carbs),fat:Number(e.fat),fiber:e.fiber==null?null:Number(e.fiber),sodium:e.sodium==null?null:Number(e.sodium),water:e.water==null?null:Number(e.water),code:e.code||null,source:e.source||`AI`,category:e.category||`Makanan`,type:e.type||`food`,basis:e.basis||`100 g`,sourceUrls:e.sourceUrls||[],sourceNames:e.sourceNames||[],validationStatus:e.validationStatus||`ai_estimated`,isEstimation:e.isEstimation??!0,confidence:e.confidence||`low`,estimationNotes:e.estimationNotes||``};return!Number.isFinite(n.kcal)||!Number.isFinite(n.protein)||!Number.isFinite(n.carbs)||!Number.isFinite(n.fat)?null:n}function D(e,t=null){let n=C(e);if(!n)return null;if(y.has(n)&&y.get(n))return y.get(n);let r=(t||w())[n];return r&&Date.now()-Number(r.cachedAt||0)<v?(y.set(n,r),r):null}function O(e,t){let n=C(e);if(!n||!t)return;let r={...t,cachedAt:Date.now()};y.set(n,r),T(e,r)}async function k(e){await f;let t=[...new Map(e.map(e=>[C(e),e]).filter(([e])=>e)).values()],n=new Map,r=[],a=w(),o=[];for(let e of t){let t=C(e),s=ue(e,i,p());if(s){n.set(t,s);continue}let c=D(e,a);c?n.set(t,c):b.has(t)?o.push({key:t,promise:b.get(t)}):r.push(e)}if(o.length){let e=await Promise.all(o.map(async e=>({key:e.key,nutrition:await e.promise})));for(let t of e)n.set(t.key,t.nutrition)}if(!r.length)return n;try{let e=await fetch(`${g}/find-nutrition-batch`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({names:r})});if(!e.ok){let t=await e.json().catch(()=>({})),n=Error(t.error||`Batch HTTP ${e.status}`);throw n.status=e.status,n}let t=await e.json();if(!t.success||!Array.isArray(t.foods))throw Error(`Format respons batch tidak valid.`);let i=new Map;for(let e of t.foods){let t=e.name||e.requestedName;if(!t)continue;let n=C(t);n&&(e.found!==!0||!e.food?i.set(n,null):i.set(n,e.food))}for(let e of r){let t=C(e),r=E(i.get(t),e);r?(O(e,r),n.set(t,r)):n.set(t,null)}console.log(`===== KALORIKU BATCH =====`),console.log(`Jumlah permintaan:`,r.length),console.log(`Firestore hits:`,t.firestoreHits),console.log(`AI generated:`,t.aiGenerated),console.log(`Failed:`,t.failed),console.log(`==========================`)}catch(e){if(console.error(`Batch nutrition error:`,e),e.status===404||e.status===405){console.warn(`Endpoint batch belum tersedia. Menggunakan endpoint lama.`);let e=await Promise.all(r.map(async e=>({key:C(e),nutrition:await findFoodWithAI(e)})));for(let t of e)n.set(t.key,t.nutrition)}else for(let e of r)n.set(C(e),null)}return n}async function A(a,{showAnalysisLoading:s=!0}={}){await f,o=a;let c=++l,p=e(`detectedFoods`);p.innerHTML=``;let h=new Map,g=new Map,_={kcal:0,protein:0,carbs:0,fat:0,water:0};function v(){return c===l}function y(){let e=p.querySelector(`.detected-total-text`);e&&(e.textContent=`${Math.round(_.kcal)} ${t(`calories`)} | ${t(`protein`)} ${_.protein.toFixed(1)} g | ${t(`carbohydrates`)} ${_.carbs.toFixed(1)} g | ${t(`fat`)} ${_.fat.toFixed(1)} g | ${Math.round(_.water)} ml ${t(`water`)}`)}function b(e,n){let r=g.get(e);if(!r)return;if(r.contribution=null,h.set(e,n),!n||r.weight<=0){r.nutritionInfo.textContent=t(`nutritionNotFound`),r.statusDot.hidden=!1,y();return}r.statusDot.hidden=!0;let i=r.weight/100,a={kcal:(Number(n.kcal)||0)*i,protein:(Number(n.protein)||0)*i,carbs:(Number(n.carbs)||0)*i,fat:(Number(n.fat)||0)*i,water:n.water==null?0:(Number(n.water)||0)*i};r.contribution=a,_.kcal+=a.kcal,_.protein+=a.protein,_.carbs+=a.carbs,_.fat+=a.fat,_.water+=a.water,r.nutritionInfo.textContent=`${Math.round(a.kcal)} ${t(`calories`)} | ${t(`protein`)} ${a.protein.toFixed(1)} g | ${t(`carbohydrates`)} ${a.carbs.toFixed(1)} g | ${t(`fat`)} ${a.fat.toFixed(1)} g`,y()}for(let o of a){let s=document.createElement(`div`);s.className=`detected-food-item`;let c=document.createElement(`div`),l=o.originalName||o.name,u=document.createElement(`div`);u.className=`detected-food-name`;let d=document.createElement(`strong`);d.textContent=o.name,u.appendChild(d);let f=Number(o.estimatedWeight)||0,h=document.createElement(`p`);h.textContent=`${t(`estimatedWeight`)} ${f} ${t(`gram`)}`;let _=document.createElement(`small`);_.textContent=`${t(`aiConfidence`)} ${o.confidence||t(`unknown`)}`;let v=document.createElement(`p`);v.textContent=t(`analyzing`);let y=document.createElement(`span`);y.className=`nutrition-status-dot`,y.hidden=!0,y.title=t(`nutritionNotFoundTitle`),u.appendChild(y),c.append(u,h,_,v);let b=document.createElement(`button`);b.type=`button`,b.className=`detected-food-edit-icon`,b.dataset.foodEditTour=`trigger`,b.setAttribute(`aria-label`,t(`edit`)),b.title=t(`edit`),b.innerHTML=`
      <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
      </svg>
    `,b.addEventListener(`click`,()=>{x({mode:`edit`,food:o,pangankuFoods:i,findFoodSuggestions:ce,onSave:({originalName:t,selectedFoodName:i,weight:s})=>{m(t||l,i),o.name!==i&&m(o.name,i),o.originalName=t||l,o.name=i,o.estimatedWeight=Number(s),e(`result`).hidden=!0,n=null,r=null,A(a,{showAnalysisLoading:!1})},onDelete:t=>{let i=a.indexOf(t);i!==-1&&a.splice(i,1),e(`result`).hidden=!0,n=null,r=null,A(a,{showAnalysisLoading:!1})}})}),s.append(c,b),p.appendChild(s),g.set(o,{item:s,food:o,weight:f,name:d,nameRow:u,nutritionInfo:v,statusDot:y,contribution:null})}let S=document.createElement(`button`);S.type=`button`,S.textContent=`+ ${t(`addFood`)}`,S.className=`add-food-button`,S.addEventListener(`click`,()=>{x({mode:`add`,pangankuFoods:i,findFoodSuggestions:ce,onSave:({selectedFoodName:i,weight:o})=>{a.push({name:i,originalName:i,estimatedWeight:Number(o),confidence:t(`manuallySelected`)}),e(`result`).hidden=!0,n=null,r=null,A(a,{showAnalysisLoading:!1})}})}),p.appendChild(S);let w=document.createElement(`div`);w.className=`detected-food-item`;let T=document.createElement(`div`),E=document.createElement(`strong`);E.textContent=t(`totalNutrition`);let D=document.createElement(`p`);D.className=`detected-total-text`,T.append(E,D),w.appendChild(T);let O=document.createElement(`button`);O.type=`button`,O.textContent=t(`saveFood`),O.className=`save-group-button`,O.addEventListener(`click`,async()=>{if(!O.disabled){O.disabled=!0;try{let e=(await Promise.all(a.map(async e=>{let t=Number(e.estimatedWeight)||0,n=h.has(e)?h.get(e):await findFoodWithAI(e.name);if(!n||t<=0||n.kcal==null)return null;let r=t/100;return{name:e.name,weight:t,kcal:n.kcal*r,protein:n.protein*r,carbs:n.carbs*r,fat:n.fat*r,fiber:n.fiber==null?null:n.fiber*r,sodium:n.sodium==null?null:n.sodium*r,water:n.water==null?null:n.water*r,source:n.source,code:n.code}}))).filter(Boolean);if(!e.length){showAppModal({type:`warning`,title:t(`noData`),message:t(`noFoodNutrition`)});return}let n=e.reduce((e,t)=>(e.kcal+=Number(t.kcal)||0,e.protein+=Number(t.protein)||0,e.carbs+=Number(t.carbs)||0,e.fat+=Number(t.fat)||0,e.water+=Number(t.water)||0,e),{kcal:0,protein:0,carbs:0,fat:0,water:0}),r=xe();r.push({id:De(),name:t(`photoMenu`),foods:e,foodCount:e.length,...n,date:new Date().toLocaleDateString(`sv-SE`),createdAt:Date.now()}),Se(r),Ve([r[r.length-1]]).catch(e=>{console.error(`Gagal memasukkan scan foto ke antrean:`,e)}),ot(),d(),showAppModal({type:`success`,title:t(`success`),message:t(`foodSaved`)})}catch(e){console.error(`Gagal menyimpan scan:`,e),showAppModal({type:`warning`,title:t(`noData`),message:t(`noFoodNutrition`)})}finally{O.disabled=!1}}});let j=document.createElement(`button`);j.type=`button`,j.textContent=t(`cancel`),j.className=`cancel-button`,j.addEventListener(`click`,async()=>{await window.confirmAppModal({type:`warning`,title:t(`cancel`),message:t(`cancelIdentification`),confirmText:t(`yes`),cancelText:t(`cancel`)})&&d()});let ee=document.createElement(`div`);ee.className=`group-actions`,ee.append(j,O),w.appendChild(ee),p.appendChild(w),y();let M=a.map(e=>e.name);try{s&&u(`calculating`);let e=await k(M);if(!v())return;for(let t of a){let n=e.get(C(t.name))||null,r=g.get(t);if(r){if(n){let e=Object.keys(i).find(e=>i[e]===n);e&&(t.originalName=t.originalName||t.name,t.name=e,r.name.textContent=e)}b(t,n)}}}catch(e){if(console.error(`Batch nutrisi gagal:`,e),!v())return;for(let e of a)b(e,null)}setTimeout(()=>{v()&&xt()},700)}function j(n){let a=ce(n,i),o=e(`suggestionList`);o.innerHTML=``,a.length?(a.forEach(n=>{let i=document.createElement(`button`);i.type=`button`,i.className=`suggestion-item`,i.textContent=`${n.name} — ${n.food.kcal??`—`} ${t(`calories`)} / ${t(`per100g`)}`,i.addEventListener(`click`,()=>{e(`foodName`).value=n.name,r=n.food,e(`foodSuggestions`).hidden=!0,e(`calculateButton`).click()}),o.appendChild(i)}),e(`foodSuggestions`).hidden=!1):(e(`foodSuggestions`).hidden=!1,o.innerHTML=`
      <p class="no-suggestion">
        ${h(n)} ${t(`noSuggestion`)}
      </p>
      <p class="suggestion-hint">
        ${t(`tryOtherFood`)}
      </p>
    `)}e(`calculateButton`).addEventListener(`click`,async()=>{await f;let a=e(`foodName`).value.trim(),o=Number(e(`foodWeight`).value);if(!a||!o||o<=0){showAppModal({type:`warning`,title:t(`enterFoodData`),message:t(`enterValidFood`)});return}let s=e(`calculateButton`),c=s.innerHTML;s.disabled=!0;try{let c=r||ue(a,i,p());if(r=null,!c){s.innerHTML=t(`searchingDatabase`);let e=await fetch(`${g}/lookup-food`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:a})}),n=await e.json().catch(()=>null);if(!e.ok)throw Error(n?.error||`HTTP ${e.status}`);if(!n||n.success!==!0)throw Error(n?.error||`Respons database tidak valid.`);n.found===!0&&n.food&&(c=n.food)}if(!c){e(`result`).hidden=!0,j(a);return}if(c.kcal===null||c.kcal===void 0||!Number.isFinite(Number(c.kcal))){showAppModal({type:`warning`,title:t(`emptyData`),message:t(`dataUnavailable`)});return}e(`foodSuggestions`).hidden=!0;let l=o/100;n={name:a,weight:o,kcal:Number(c.kcal)*l,protein:Number(c.protein||0)*l,carbs:Number(c.carbs||0)*l,fat:Number(c.fat||0)*l,fiber:c.fiber==null?null:Number(c.fiber)*l,sodium:c.sodium==null?null:Number(c.sodium)*l,water:c.water==null?null:Number(c.water)*l,source:c.source||`Firestore`,code:c.code||null},e(`resultDetails`).textContent=`${Math.round(n.kcal)} ${t(`calories`)} | ${t(`protein`)} ${n.protein.toFixed(1)} g | ${t(`carbohydrates`)} ${n.carbs.toFixed(1)} g | ${t(`fat`)} ${n.fat.toFixed(1)} g | ${Math.round(n.water||0)} ml ${t(`water`)}`,e(`result`).hidden=!1}catch(e){console.error(`Manual food lookup error:`,e),showAppModal({type:`error`,title:`Gagal mencari makanan`,message:e.message||`Tidak dapat terhubung ke database. Silakan coba lagi.`})}finally{s.disabled=!1,s.innerHTML=c}}),e(`saveMeal`).addEventListener(`click`,()=>{if(!n)return;let e=xe();e.push({id:De(),...n,date:new Date().toLocaleDateString(`sv-SE`),createdAt:Date.now()}),Se(e),Ve([e[e.length-1]]).catch(e=>{console.error(`Gagal memasukkan scan manual ke antrean:`,e)}),ot(),d(),showAppModal({type:`success`,title:t(`success`),message:t(`foodSaved`)})}),window.cariPanganku=function(e){return ce(e,i,15).map(e=>({nama:e.name,kcal:e.food.kcal,protein:e.food.protein,karbohidrat:e.food.carbs,lemak:e.food.fat}))},e(`resetMeal`)?.addEventListener(`click`,async()=>{await window.confirmAppModal({type:`warning`,title:t(`resetAll`),message:t(`resetAll`),confirmText:t(`yes`),cancelText:t(`cancel`)})&&d()}),e(`cancelMeal`)?.addEventListener(`click`,()=>{e(`foodName`).value=``,e(`foodWeight`).value=100,e(`result`).hidden=!0,e(`resultDetails`).textContent=``,n=null,r=null,e(`foodSuggestions`).hidden=!0,e(`suggestionList`).innerHTML=``});function M(){let e=document.querySelector(`.topbar`);if(!e)return;function t(){e.classList.toggle(`is-scrolled`,window.scrollY>20)}window.addEventListener(`scroll`,t,{passive:!0}),t()}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,M):M();function te(){let n=e(`welcomeGreeting`);if(!n)return;let r={};try{r=JSON.parse(localStorage.getItem(`kaloriku_profile`)||`{}`)}catch(e){console.error(`Gagal membaca profil:`,e)}let i=r.name?.trim();n.textContent=i?window.getLanguage?.()===`en`?`Hello, ${i}! 👋`:`Halo, ${i}! 👋`:t(`greeting`)}te(),window.addEventListener(`profileUpdated`,te);function N(){let t=e(`dashboardAvatar`),n=e(`dashboardAvatarPhoto`),r=e(`dashboardAvatarInitial`);if(!t||!n||!r)return;let i={};try{i=JSON.parse(localStorage.getItem(`kaloriku_profile`)||`{}`)}catch(e){console.error(`Gagal membaca profil:`,e)}i.photo?(n.src=i.photo,n.hidden=!1,r.hidden=!0):(n.removeAttribute(`src`),n.hidden=!0,r.hidden=!1,r.textContent=i.name?.trim().charAt(0).toUpperCase()||`K`)}N(),window.addEventListener(`profileUpdated`,N),window.addEventListener(`languageChanged`,async()=>{te(),N(),u(s,c),o&&!e(`analysisResults`).hidden&&await A(o),n&&!e(`result`).hidden&&(e(`resultDetails`).textContent=`${Math.round(n.kcal)} ${t(`calories`)} | ${t(`protein`)} ${n.protein.toFixed(1)} g | ${t(`carbohydrates`)} ${n.carbs.toFixed(1)} g | ${t(`fat`)} ${n.fat.toFixed(1)} g`)})})),Tt=r((()=>{Ee();var e=e=>document.getElementById(e),t=e=>window.t?.(e)??e;function n(){return window.getLanguage?.()===`en`?`en-US`:`id-ID`}function r(e,t=2){return Number(e).toLocaleString(n(),{maximumFractionDigits:t})}function i(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#039;`})[e])}function a(e){if(!e)return t(`historyDynamic.unknownDate`);let r=new Date(`${e}T00:00:00`);return Number.isNaN(r.getTime())?e:r.toLocaleDateString(n(),{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`})}function o(e,t){let n=Number(e);return e==null||e===``||!Number.isFinite(n)?`—`:`${r(n)} ${t}`}function s(e){return`
    <div class="history-nutrition-grid">
      ${[{label:t(`historyDynamic.calories`),value:e.kcal,unit:`kcal`},{label:t(`historyDynamic.protein`),value:e.protein,unit:`g`},{label:t(`historyDynamic.carbohydrates`),value:e.carbs,unit:`g`},{label:t(`historyDynamic.fat`),value:e.fat,unit:`g`},{label:t(`historyDynamic.fiber`),value:e.fiber,unit:`g`},{label:t(`historyDynamic.sodium`),value:e.sodium,unit:`mg`},{label:t(`historyDynamic.water`),value:e.water,unit:`g`}].map(e=>`
        <div class="history-nutrition-item">
          <span>${i(e.label)}</span>
          <strong>${o(e.value,e.unit)}</strong>
        </div>
      `).join(``)}
    </div>
  `}function c(e){let n=[{key:`kcal`,label:t(`historyDynamic.calories`),unit:`kcal`},{key:`protein`,label:t(`historyDynamic.protein`),unit:`g`},{key:`carbs`,label:t(`historyDynamic.carbohydrates`),unit:`g`},{key:`fat`,label:t(`historyDynamic.fat`),unit:`g`},{key:`fiber`,label:t(`historyDynamic.fiber`),unit:`g`},{key:`sodium`,label:t(`historyDynamic.sodium`),unit:`mg`},{key:`water`,label:t(`historyDynamic.water`),unit:`g`}],r=e.flatMap(e=>Array.isArray(e.foods)&&e.foods.length?e.foods:[e]);return n.map(e=>{let t=r.map(t=>{let n=t[e.key];return n==null||n===``?null:Number(n)}),n=t.every(e=>e!==null&&Number.isFinite(e));return{...e,total:n?t.reduce((e,t)=>e+t,0):null}})}function l(e){let n=c(e),a=e=>n.find(t=>t.key===e)?.total??null,s=a(`kcal`),l=a(`protein`),u=a(`carbs`),d=a(`fat`),f=Number(Ce()),p=Number.isFinite(f)&&f>0,m=s!==null&&Number.isFinite(s),h=p&&m?s/f*100:null,g=h===null?0:Math.min(h,100),_=p&&m?f-s:null,v=[l,u,d].every(e=>e!==null&&Number.isFinite(e)&&e>=0),y=v?l*4:0,b=v?u*4:0,x=v?d*9:0,S=y+b+x,C=S>0?y/S*100:0,w=S>0?b/S*100:0;S>0&&x/S*100;let T=v&&S>0?`
      <div
        class="history-macro-donut"
        style="background: conic-gradient(
          var(--history-blue) 0% ${C}%,
          var(--history-orange) ${C}% ${C+w}%,
          var(--history-purple) ${C+w}% 100%
        )"
      >
        <div class="history-macro-donut-center">
          <strong>3</strong>
          <span>${i(t(`historyDynamic.macro`))}</span>
        </div>
      </div>

      <div class="history-macro-legend">
        <div>
          <i class="protein-dot"></i>
          <span>${i(t(`historyDynamic.protein`))}</span>
          <strong>${r(l,1)} g</strong>
        </div>

        <div>
          <i class="carbs-dot"></i>
          <span>${i(t(`historyDynamic.carbohydrateShort`))}</span>
          <strong>${r(u,1)} g</strong>
        </div>

        <div>
          <i class="fat-dot"></i>
          <span>${i(t(`historyDynamic.fat`))}</span>
          <strong>${r(d,1)} g</strong>
        </div>
      </div>
    `:`
      <p class="history-macro-unavailable">
        ${i(t(`historyDynamic.incompleteMacro`))}
      </p>
    `,E=n.filter(e=>e.key!==`kcal`).map(e=>`
      <div class="history-summary-item">
        <span>${i(e.label)}</span>
        <strong>${o(e.total,e.unit)}</strong>
      </div>
    `).join(``);return`
    <div class="history-daily-summary">

      <div class="history-summary-header">
        <div>
          <span>${i(t(`historyDynamic.nutritionPerformance`))}</span>
          <strong>${i(t(`historyDynamic.dailySummary`))}</strong>
        </div>

        <span class="history-meal-count">
          ${e.length} ${i(t(`historyPage.recordCount`))}
        </span>
      </div>

      <div class="history-calorie-panel">
        <div class="history-calorie-heading">
          <span>${i(t(`historyDynamic.totalCalories`))}</span>
          <span class="history-calorie-badge">
            ${i(t(`historyDynamic.calorieBadge`))}
          </span>
        </div>

        <div class="history-calorie-number">
          <strong>${o(s,`kcal`)}</strong>
        </div>

        <div class="history-target-info">
          <span>${i(t(`historyDynamic.dailyTarget`))}</span>
          <strong>
            ${p?o(f,`kcal`):i(t(`historyDynamic.notSet`))}
          </strong>
        </div>

        ${h===null?`
              <p class="history-target-unavailable">
                ${i(t(p?`historyDynamic.incompleteCalories`:`historyDynamic.setCalorieTarget`))}
              </p>
            `:`
              <div class="history-progress-track">
                <div
                  class="history-progress-fill"
                  style="--history-progress-width: ${g}%"
                ></div>
              </div>

              <div class="history-progress-caption">
                <strong>
                  ${r(h,1)}%
                  ${i(t(`historyDynamic.achieved`))}
                </strong>

                <span>
                  ${_>=0?`${i(t(`historyDynamic.remaining`))} ${o(_,`kcal`)}`:`${i(t(`historyDynamic.exceeded`))} ${o(Math.abs(_),`kcal`)}`}
                </span>
              </div>
            `}
      </div>

      <div class="history-macro-section">
        <div class="history-macro-heading">
          <div>
            <span>${i(t(`historyDynamic.nutritionComposition`))}</span>
            <strong>${i(t(`historyDynamic.macroDistribution`))}</strong>
          </div>
        </div>

        <div class="history-macro-content">
          ${T}
        </div>
      </div>

      <div class="history-summary-heading">
        <span>${i(t(`historyDynamic.nutritionDetails`))}</span>
        <strong>${i(t(`historyDynamic.totalIntake`))}</strong>
      </div>

      <div class="history-summary-grid">
        ${E}
      </div>

    </div>
  `}function u(e,t=1800){if(!e)return;let r=e.dataset.countTarget||e.textContent.trim(),i=r.match(/-?[\d.,]+/);if(!i)return;let a=i[0];a=a.includes(`.`)&&a.includes(`,`)?a.replace(/\./g,``).replace(`,`,`.`):a.includes(`.`)?a.replace(/\./g,``):a.replace(`,`,`.`);let o=Number(a);if(!Number.isFinite(o))return;let s=r.slice(0,i.index),c=r.slice(i.index+i[0].length),l=new Intl.NumberFormat(n(),{maximumFractionDigits:2});e.dataset.countTarget=r;let u=performance.now();function d(n){let i=Math.min((n-u)/t,1),a=1-(1-i)**4;e.textContent=`${s}${l.format(o*a)}${c}`,i<1?requestAnimationFrame(d):e.textContent=r}e.textContent=`${s}0${c}`,requestAnimationFrame(d)}function d(){let t=e(`fullHistoryList`);if(!t)return;let n=t.querySelectorAll(`.history-day`);n.length&&(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches?n.forEach(e=>e.classList.add(`history-animated`)):(n.forEach(e=>{e.classList.remove(`history-animated`),e.querySelectorAll(`.history-calorie-number strong, .history-target-info strong, .history-progress-caption strong, .history-progress-caption span, .history-summary-grid .history-summary-item strong, .history-macro-legend strong`).forEach(e=>{e.dataset.countTarget||(e.dataset.countTarget=e.textContent.trim()),e.textContent=e.dataset.countTarget}),e.querySelectorAll(`.history-record`).forEach((e,t)=>{e.style.setProperty(`--history-delay`,`${300+t*120}ms`)})}),t.getBoundingClientRect(),requestAnimationFrame(()=>{requestAnimationFrame(()=>{n.forEach((e,t)=>{setTimeout(()=>{e.classList.add(`history-animated`),e.querySelectorAll(`.history-calorie-number strong, .history-target-info strong, .history-progress-caption strong, .history-progress-caption span, .history-summary-grid .history-summary-item strong, .history-macro-legend strong`).forEach(e=>{u(e,1800)})},t*250)})})})))}function f(n=``){let o=e(`fullHistoryList`),c=e(`historyCount`);if(!o||!c)return;let u=xe().slice();if(n&&(u=u.filter(e=>e.date===n)),u.sort((e,t)=>{let n=e.createdAt||new Date(e.date||0).getTime();return(t.createdAt||new Date(t.date||0).getTime())-n}),c.textContent=`${u.length} ${t(`historyPage.recordCount`)}`,u.length===0){o.innerHTML=`
      <div class="history-empty">
        <div class="history-empty-icon">▤</div>

        <h3>
          ${i(t(n?`historyDynamic.noHistory`:`historyDynamic.emptyHistory`))}
        </h3>

        <p>
          ${i(t(n?`historyDynamic.noHistoryDate`:`historyDynamic.emptyHistoryDescription`))}
        </p>
      </div>
    `;return}let f={};u.forEach(e=>{let n=e.date||t(`historyDynamic.unknownDate`);f[n]||(f[n]=[]),f[n].push(e)}),o.innerHTML=Object.entries(f).map(([e,n],o)=>{let c=n.map((e,n)=>{let a=Array.isArray(e.foods)?e.foods:[e],c=a.map(e=>{let n=i(e.name||t(`historyDynamic.food`)),a=Number(e.weight??e.estimatedWeight),o=Number(e.kcal)||0;return`
            <div class="history-food-item">
              <div>
                <strong>${n}</strong>

                <small>
                  ${Number.isFinite(a)&&a>0?`${r(a)} ${i(t(`historyDynamic.gram`))}`:i(t(`historyDynamic.weightUnavailable`))}
                </small>
              </div>

              <span>${r(Math.round(o))} kcal</span>
            </div>
          `}).join(``),l=`history-info-${o}-${n}`,u=a.map(e=>`
          <div class="history-food-nutrition">
            <strong>
              ${i(e.name||t(`historyDynamic.food`))}
            </strong>

            ${s(e)}
          </div>
        `).join(``);return`
          <article class="history-record">

            <div class="history-record-header">
              <strong>
                ${i(e.name||t(`historyDynamic.foodRecord`))}
              </strong>

              <b>
                ${r(Math.round(Number(e.kcal)||0))} kcal
              </b>
            </div>

            <div class="history-food-list">
              ${c}
            </div>

            <button
              type="button"
              class="history-info-button"
              data-info-target="${l}"
            >
              <span>ⓘ</span>
              ${i(t(`historyDynamic.nutritionInfo`))}
            </button>

            <div
              id="${l}"
              class="history-info-panel"
              hidden
            >
              ${u}
            </div>

          </article>
        `}).join(``);return`
        <section class="history-day">

          <div class="history-day-header">
            <h3>${i(a(e))}</h3>
          </div>

          ${l(n)}

          ${c}

        </section>
      `}).join(``),d()}function p(){let n=e(`historyDate`),r=e(`resetHistoryFilter`);e(`historyCalendarButton`)?.addEventListener(`click`,()=>{typeof n?.showPicker==`function`?n.showPicker():n?.click()}),n?.addEventListener(`change`,()=>{f(n.value)}),r?.addEventListener(`click`,()=>{n&&(n.value=``),f()}),document.addEventListener(`kaloriku:pagechange`,e=>{e.detail?.pageId===`historyPage`&&f(n?.value||``)}),window.addEventListener(`languageChanged`,()=>{f(n?.value||``)}),e(`fullHistoryList`)?.addEventListener(`click`,e=>{let n=e.target.closest(`[data-info-target]`);if(!n)return;let r=document.getElementById(n.dataset.infoTarget);r&&(r.hidden=!r.hidden,n.innerHTML=r.hidden?`<span>ⓘ</span> ${i(t(`historyDynamic.nutritionInfo`))}`:`<span>⌃</span> ${i(t(`historyDynamic.closeInfo`))}`)}),f(n?.value||``)}p()}));function Et(){let e=o.currentUser;if(!e)return null;try{let t=JSON.parse(localStorage.getItem(`kaloriku_user`)||`{}`);return t.loginMethod!==`google`||t.uid!==e.uid?null:e}catch(e){return console.error(`Gagal memeriksa akun:`,e),null}}function Dt(){return new Promise((e,t)=>{let n=()=>{};n=h(o,t=>{n(),e(t)},e=>{n(),t(e)})})}function Ot(e){let{name:t,age:n,gender:r,weight:i,height:a,activity:o,goalWeight:s,goalDuration:c,dailyCalorieTarget:l,dailyProteinTarget:u,dailyCarbTarget:d,dailyFatTarget:f}=e||{};return Object.fromEntries(Object.entries({name:t,age:n,gender:r,weight:i,height:a,activity:o,goalWeight:s,goalDuration:c,dailyCalorieTarget:l,dailyProteinTarget:u,dailyCarbTarget:d,dailyFatTarget:f}).filter(([,e])=>e!==void 0))}async function kt(){try{await Dt();let e=Et();if(!e)return null;let t=l(n,`users`,e.uid,`profile`,`main`),r=await u(t),i={};try{i=JSON.parse(localStorage.getItem(`kaloriku_profile`)||`{}`)}catch(e){console.error(`Profil lokal tidak valid:`,e)}if(r.exists()){let{updatedAt:e,...t}=r.data(),n={...i,...t,photo:i.photo||``};return localStorage.setItem(`kaloriku_profile`,JSON.stringify(n)),console.log(`Profil berhasil dimuat dari Firestore.`),n}let a=Ot(i);return Object.values(a).some(e=>e!=null&&e!==``)&&(await p(t,{...a,updatedAt:f()}),console.log(`Profil lokal berhasil disalin ke Firestore.`)),i}catch(e){return console.error(`Gagal memuat profil cloud:`,e),null}}function At(e){return Nt||window.__kalorikuResetInProgress?Promise.resolve(!1):(Mt=Mt.then(async()=>{if(Nt||window.__kalorikuResetInProgress)return!1;let t=Et();if(!t)return!1;let r=Ot(e),i=l(n,`users`,t.uid,`profile`,`main`);return await p(i,{...r,updatedAt:f()},{merge:!0}),console.log(`Profil berhasil disinkronkan ke Firestore.`),!0}).catch(e=>(console.error(`Gagal menyinkronkan profil:`,e),!1)),Mt)}async function jt(){Nt=!0;try{await Mt;let e=Et();if(!e)throw Error(`Akun Google tidak ditemukan.`);let t=l(n,`users`,e.uid,`profile`,`main`);await c(t)}catch(e){throw console.error(`Gagal menghapus profil Firestore:`,e),e}finally{Nt=!1}}var Mt,Nt,Pt=a((()=>{i(),Mt=Promise.resolve(),Nt=!1})),Ft=r((()=>{Pt(),Ye(),i();var e=`kaloriku_profile`;function t(e){return window.t?window.t(e):e}function n(){try{return JSON.parse(localStorage.getItem(e)||`{}`)}catch(e){return console.error(`Gagal membaca profil:`,e),{}}}function r(t){window.__kalorikuResetInProgress||(localStorage.setItem(e,JSON.stringify(t)),At(t))}var a=null;function s(){let e=document.getElementById(`profilePage`);e&&!e.hidden&&(a&&cancelAnimationFrame(a),e.classList.remove(`profile-page-animated`),e.querySelectorAll(`:scope > .welcome, :scope > .language-setting, :scope > .profile-identity, :scope > .profile-form-start, :scope > #profileWizard, :scope > .goal-simulation-card, :scope > .profile-section:not(.language-setting), :scope > .profile-actions`).forEach((e,t)=>{e.style.setProperty(`--profile-animation-delay`,`${t*90}ms`)}),e.offsetWidth,a=requestAnimationFrame(()=>{a=requestAnimationFrame(()=>{e.classList.add(`profile-page-animated`)})}))}document.addEventListener(`kaloriku:pagechange`,e=>{e.detail?.pageId===`profilePage`&&s()});async function c(){let e=document.getElementById(`profilePage`);if(!e){console.warn(`Halaman Profil tidak ditemukan.`);return}await kt();let i={name:e.querySelector(`#profileName`),age:e.querySelector(`#profileAge`),gender:e.querySelector(`#profileGender`),weight:e.querySelector(`#profileWeight`),height:e.querySelector(`#profileHeight`),activity:e.querySelector(`#profileActivity`),goalWeight:e.querySelector(`#profileGoalWeight`),goalDuration:e.querySelector(`#profileGoalDuration`)},a=e.querySelector(`#profileDisplayName`),s=e.querySelector(`#profileDisplayEmail`),c=null;function u(e=c){if(!a||!s)return;if(!e){a.textContent=t(`profile.identity.defaultName`),s.textContent=t(`profile.identity.notLoggedIn`);return}let n=e.email||``;a.textContent=e.displayName||i.name?.value?.trim()||n.split(`@`)[0]||t(`profile.identity.defaultName`),s.textContent=n||t(`profile.identity.emailUnavailable`)}h(o,e=>{c=e,u(e)});let d=e.querySelector(`#profileWizard`),f=e.querySelector(`#profileFormStart`),p=[...e.querySelectorAll(`.profile-step`)],m=e.querySelector(`#profileStepLabel`),g=e.querySelector(`#profileWizardProgress`),_=e.querySelector(`#profileStepBack`),v=e.querySelector(`#profileStepNext`),y=0,b=[`profile.wizard.personalTitle`,`profile.wizard.bodyTitle`,`profile.wizard.activityTitle`,`profile.wizard.goalTitle`];function x(e){if(!(!d||!p.length||e<0||e>=p.length)){if(y=e,p.forEach((e,t)=>{e.hidden=t!==y}),m){let n=t(`profile.wizard.stepLabel`).replace(`{current}`,e+1).replace(`{total}`,p.length),r=t(b[e]);m.textContent=`${n} · ${r}`}g&&(g.style.width=`${(e+1)/p.length*100}%`),_&&(_.hidden=e===0),v&&(v.textContent=e===p.length-1?t(`profile.wizardButtons.finish`):t(`profile.wizardButtons.next`))}}f?.addEventListener(`click`,()=>{d&&p.length&&(d.hidden=!1,f.hidden=!0,x(0),d.scrollIntoView({behavior:`smooth`,block:`start`}))}),_?.addEventListener(`click`,()=>{x(y-1)}),v?.addEventListener(`click`,()=>{y<p.length-1?(x(y+1),d.scrollIntoView({behavior:`smooth`,block:`start`})):N()&&(d.hidden=!0,f&&(f.hidden=!1,f.scrollIntoView({behavior:`smooth`,block:`center`})))}),p.length&&x(0);let S=e.querySelector(`#profilePhotoButton`),C=e.querySelector(`#profilePhotoInput`),w=e.querySelector(`#profilePhotoPreview`),T=e.querySelector(`#profileAvatarInitial`);function E(){let e=n(),t=e.photo||``;t&&w?(w.src=t,w.hidden=!1,T&&(T.hidden=!0)):(w&&(w.removeAttribute(`src`),w.hidden=!0),T&&(T.hidden=!1,T.textContent=e.name?.trim().charAt(0).toUpperCase()||`K`))}S?.addEventListener(`click`,()=>{C?.click()});function D(e){return new Promise((t,n)=>{let r=new Image,i=new FileReader;i.onload=e=>{r.src=e.target.result},i.onerror=()=>{n(Error(`Gagal membaca file foto.`))},r.onload=()=>{let e=r.width,i=r.height;(e>500||i>500)&&(e>i?(i=Math.round(500/e*i),e=500):(e=Math.round(500/i*e),i=500));let a=document.createElement(`canvas`);a.width=e,a.height=i;let o=a.getContext(`2d`);o?(o.fillStyle=`#ffffff`,o.fillRect(0,0,e,i),o.drawImage(r,0,0,e,i),t(a.toDataURL(`image/jpeg`,.8))):n(Error(`Canvas tidak tersedia.`))},r.onerror=()=>{n(Error(`File bukan gambar yang valid.`))},i.readAsDataURL(e)})}C?.addEventListener(`change`,async e=>{let i=e.target.files[0];if(i){if(!i.type.startsWith(`image/`))showAppModal({type:`warning`,title:t(`profile.photo.fileNotSelected`),message:t(`profile.photo.selectImage`)}),C.value=``;else try{S&&(S.style.opacity=`0.6`,S.style.pointerEvents=`none`);let e=await D(i),a=n();a.photo=e,r(a),E(),window.dispatchEvent(new Event(`profileUpdated`)),showAppModal({type:`success`,title:t(`modal.success`),message:t(`profile.photo.updateSuccess`)})}catch(e){console.error(`Gagal memproses foto:`,e),showAppModal({type:`warning`,title:t(`profile.photo.failed`),message:t(`profile.photo.updateFailed`)})}finally{S&&(S.style.opacity=``,S.style.pointerEvents=``),C.value=``}}}),E();function O(a=!0){let o=e.querySelector(`#goalSimulationMessage`),s=e.querySelector(`.goal-simulation-results`);if(!o||!s)return;let c=Number(i.age?.value),u=Number(i.weight?.value),d=Number(i.height?.value),f=Number(i.goalWeight?.value),p=Number(i.goalDuration?.value),m=i.gender?.value,h=i.activity?.value;if(!c||!u||!d||!f||!p||!m||!h||c<=0||u<=0||d<=0||f<=0||p<=0){o.textContent=t(`profile.simulation.invalidData`),s.hidden=!0;return}let g={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,very_active:1.9}[h];if(!g){o.textContent=t(`profile.simulation.invalidActivity`),s.hidden=!0;return}let _=m===`male`?5:-161,v=10*u+6.25*d-5*c+_,y=v*g,b=f-u,x=p*30.4375,S=b/x*7,C=Math.abs(b)*7700/x,w=y,T=t(`profile.simulation.maintenance`),E=t(`profile.simulation.noChange`),D=t(`profile.simulation.maintenance`),O=``;if(b<0){w=y-C,T=`${t(`profile.simulation.deficit`)} ${Math.round(C)} ${t(`profile.simulation.kcalPerDay`)}`,E=`${t(`profile.simulation.decrease`)} ${Math.abs(S).toFixed(2)} kg`;let e=Math.abs(S)/u*100;e<=.75?D=t(`profile.simulation.realistic`):e<=1?(D=t(`profile.simulation.aggressive`),O=t(`profile.simulation.warningAggressiveLoss`)):(D=t(`profile.simulation.notRecommended`),O=t(`profile.simulation.warningFastLoss`))}else if(b>0){w=y+C,T=`${t(`profile.simulation.surplus`)} ${Math.round(C)} ${t(`profile.simulation.kcalPerDay`)}`,E=`${t(`profile.simulation.increase`)} ${Math.abs(S).toFixed(2)} kg`;let e=Math.abs(S)/u*100;e<=.25?D=t(`profile.simulation.realistic`):e<=.5?(D=t(`profile.simulation.aggressive`),O=t(`profile.simulation.warningAggressiveGain`)):(D=t(`profile.simulation.notRecommended`),O=t(`profile.simulation.warningFastGain`))}if(w<=0?O+=` `+t(`profile.simulation.warningInvalidCalories`):w<v&&(O+=` `+t(`profile.simulation.warningBelowBmr`)),a){let e=n();e.dailyCalorieTarget=w>0?Math.round(w):0,r(e),window.dispatchEvent(new Event(`profileTargetUpdated`))}let k=window.getLanguage?.()===`en`?`en-US`:`id-ID`,A=e=>Math.round(e).toLocaleString(k);e.querySelector(`#simCurrentWeight`).textContent=`${u} kg`,e.querySelector(`#simGoalWeight`).textContent=`${f} kg`,e.querySelector(`#simWeightDifference`).textContent=`${b>0?`+`:``}${b.toFixed(1)} kg`,e.querySelector(`#simDuration`).textContent=`${p} ${t(`profile.simulation.month`)}`,e.querySelector(`#simBMR`).textContent=`${A(v)} ${t(`profile.simulation.kcalPerDay`)}`,e.querySelector(`#simTDEE`).textContent=`${A(y)} ${t(`profile.simulation.kcalPerDay`)}`,e.querySelector(`#simWeeklyChange`).textContent=E,e.querySelector(`#simAdjustment`).textContent=T,e.querySelector(`#simCalorieTarget`).textContent=`${A(w)} ${t(`profile.simulation.kcalPerDay`)}`,e.querySelector(`#simGoalStatus`).textContent=D,e.querySelector(`#simGoalWarning`).textContent=O,o.textContent=t(`profile.simulation.simulationMessage`),s.hidden=!1;function j(t=!0){let i=e.querySelector(`#dailyCalorieTarget`),a=e.querySelector(`#dailyProteinTarget`),o=e.querySelector(`#dailyCarbTarget`),s=e.querySelector(`#dailyFatTarget`);if(!i||!a||!o||!s)return;if(w<=0){i.textContent=`—`,a.textContent=`—`,o.textContent=`—`,s.textContent=`—`;return}let u=f*1.6,d=w*.25,p=d/9,h=(w-u*4-d)/4,g=l(c,m);if(t){let e=n();e.dailyCalorieTarget=Math.round(w),e.dailyProteinTarget=Math.round(u),e.dailyCarbTarget=Math.max(0,Math.round(h)),e.dailyFatTarget=Math.round(p),e.dailyWaterTarget=g,r(e),window.dispatchEvent(new Event(`profileTargetUpdated`))}i.textContent=Math.round(w).toLocaleString(k),a.textContent=Math.round(u).toLocaleString(k),s.textContent=Math.round(p).toLocaleString(k),o.textContent=Math.max(0,Math.round(h)).toLocaleString(k)}j(a)}window.addEventListener(`languageChanged`,()=>{O(!1),u(c),x(y)});let k=e.querySelector(`.profile-save-button`),A=e.querySelector(`#resetDataButton`);A&&A.addEventListener(`click`,async()=>{if(await window.confirmAppModal({type:`warning`,title:t(`profile.reset.title`),message:t(`profile.reset.message`),cancelText:t(`profile.reset.cancel`),confirmText:t(`profile.reset.confirm`)})){A.disabled=!0,window.__kalorikuResetInProgress=!0;try{await Promise.all([Ge(),jt()]),Object.keys(localStorage).forEach(e=>{e.startsWith(`kaloriku_`)&&e!==`kaloriku_user`&&localStorage.removeItem(e)}),Object.values(i).forEach(e=>{e&&(e.value=``)}),E(),e.querySelector(`#dailyCalorieTarget`).textContent=`—`,e.querySelector(`#dailyProteinTarget`).textContent=`—`,e.querySelector(`#dailyCarbTarget`).textContent=`—`,e.querySelector(`#dailyFatTarget`).textContent=`—`;let n=e.querySelector(`.goal-simulation-results`);n&&(n.hidden=!0);let r=e.querySelector(`#goalSimulationMessage`);r&&(r.textContent=t(`profile.simulation.message`)),x(0),u(c),window.dispatchEvent(new Event(`profileTargetUpdated`)),document.dispatchEvent(new CustomEvent(`kaloriku:datareset`)),showAppModal({type:`success`,title:t(`profile.reset.successTitle`),message:t(`profile.reset.successMessage`)}),document.querySelector(`.nav-item[data-page="homePage"]`)?.click()}catch(e){console.error(`Reset semua data gagal:`,e),showAppModal({type:`error`,title:t(`profile.reset.failedTitle`),message:t(`profile.reset.failedMessage`)})}finally{window.__kalorikuResetInProgress=!1,A.disabled=!1}}});let j=n();Object.entries(i).forEach(([e,t])=>{t&&j[e]!==void 0&&(t.value=j[e])}),u(c),O(),Object.values(i).forEach(e=>{e&&(e.addEventListener(`input`,O),e.addEventListener(`change`,O))});let ee=e.querySelector(`#goalInfoButton`),M=e.querySelector(`#goalInfoModal`),te=e.querySelector(`#goalInfoClose`);if(ee&&M&&te?(ee.addEventListener(`click`,()=>{M.hidden=!1}),te.addEventListener(`click`,()=>{M.hidden=!0}),M.addEventListener(`click`,e=>{e.target===M&&(M.hidden=!0)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&(M.hidden=!0)})):console.warn(`Elemen tombol atau modal informasi tidak ditemukan.`),!k){console.error(`Tombol Simpan Profil tidak ditemukan.`);return}function N(){let e={};if(Object.entries(i).forEach(([t,n])=>{n&&(e[t]=n.value.trim())}),!e.name||!e.age||!e.gender||!e.weight||!e.height||!e.activity)return showAppModal({type:`warning`,title:t(`profile.validation.incompleteTitle`),message:t(`profile.validation.incompleteMessage`)}),!1;if(Number(e.age)<=0||Number(e.weight)<=0||Number(e.height)<=0)return showAppModal({type:`warning`,title:t(`profile.validation.invalidNumberTitle`),message:t(`profile.validation.invalidNumberMessage`)}),!1;try{return r({...n(),...e}),O(),E(),u(c),window.dispatchEvent(new Event(`profileUpdated`)),showAppModal({type:`success`,title:t(`modal.success`),message:t(`profile.saveMessages.success`)}),!0}catch(e){return console.error(`Gagal menyimpan profil:`,e),showAppModal({type:`error`,title:t(`modal.error`),message:t(`profile.saveMessages.failed`)}),!1}}k.addEventListener(`click`,()=>{N()})}function l(e,t){return e=Number(e),!Number.isFinite(e)||e<=0?0:e>=1&&e<=3?1300:e>=4&&e<=8?1700:e>=9&&e<=13?t===`male`?2e3:1850:e>=14&&e<=18?t===`male`?2350:2150:e>=19?t===`male`?2700:2500:0}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,c):c()})),It=r((()=>{Ee();var e=e=>document.getElementById(e),t=`7`,n=e=>window.t?.(e)??e;function r(){return window.getLanguage?.()===`en`?`en-US`:`id-ID`}function i(e,t=0){return Number(e).toLocaleString(r(),{minimumFractionDigits:t,maximumFractionDigits:t})}function a(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#039;`})[e])}function o(e,t,n=``,i=0,a=1800){if(!e)return;let o=Number(t);if(!Number.isFinite(o))return;let s=new Intl.NumberFormat(r(),{minimumFractionDigits:i,maximumFractionDigits:i}),c=performance.now();e.textContent=`${s.format(0)}${n}`;function l(t){let r=Math.min((t-c)/a,1),i=1-(1-r)**4,u=o*i;e.textContent=`${s.format(u)}${n}`,r<1?requestAnimationFrame(l):e.textContent=`${s.format(o)}${n}`}requestAnimationFrame(l)}function s(e){let t=document.querySelectorAll(`#statisticsPage .statistics-section`),n=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;t.forEach((e,t)=>{e.classList.remove(`statistics-animated`),e.style.setProperty(`--stat-delay`,`${t*120}ms`)}),document.querySelectorAll(`#statisticsPage .statistics-summary .statistics-card`).forEach((e,t)=>{e.style.transitionDelay=`${t*150}ms`}),n?(t.forEach(e=>{e.classList.add(`statistics-animated`)}),c(e)):(t.forEach(e=>{e.getBoundingClientRect()}),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.forEach(e=>{e.classList.add(`statistics-animated`)}),c(e)})}))}function c(t){o(e(`statTotalCalories`),Math.round(t.total.kcal)),o(e(`statAverageCalories`),Math.round(t.average)),o(e(`statTotalMeals`),t.mealCount),o(e(`statRecordedDays`),t.recordedDays),o(e(`statProtein`),t.total.protein,` g`,1),o(e(`statCarbs`),t.total.carbs,` g`,1),o(e(`statFat`),t.total.fat,` g`,1);let n=e(`calorieChart`);n&&n.querySelectorAll(`.statistics-chart-column strong`).forEach(e=>{let t=Number(e.dataset.chartValue);Number.isFinite(t)&&o(e,t)})}function l(e){return Array.isArray(e.foods)&&e.foods.length?e.foods:[e]}function u(e){return l(e).reduce((e,t)=>(e.kcal+=Number(t.kcal)||0,e.protein+=Number(t.protein)||0,e.carbs+=Number(t.carbs)||0,e.fat+=Number(t.fat)||0,e),{kcal:0,protein:0,carbs:0,fat:0})}function d(){let e=xe(),n=new Date;if(n.setHours(0,0,0,0),t===`all`)return e;let r=Number(t),i=new Date(n);return i.setDate(n.getDate()-(r-1)),e.filter(e=>{if(!e.date)return!1;let t=new Date(`${e.date}T00:00:00`);return!Number.isNaN(t.getTime())&&t>=i&&t<=n})}function f(){let e=xe();if(t===`all`)return[];let n=Number(t),r=new Date;r.setHours(0,0,0,0);let i=new Date(r);i.setDate(r.getDate()-(n-1));let a=new Date(i);a.setDate(a.getDate()-1);let o=new Date(a);return o.setDate(a.getDate()-(n-1)),e.filter(e=>{if(!e.date)return!1;let t=new Date(`${e.date}T00:00:00`);return!Number.isNaN(t.getTime())&&t>=o&&t<=a})}function p(){try{return JSON.parse(localStorage.getItem(`kaloriku_profile`)||`{}`)}catch(e){return console.error(`Gagal membaca profil:`,e),{}}}function m(e){let t=p(),n=Number(t.weight),r=Number(t.goalWeight),i=Number(t.goalDuration),a=Number(t.dailyCalorieTarget)||Ce(),o=Number(t.tdee);if(!n||!r||!i||!a)return null;let s=r-n,c=s/(i*4.345),l=0;return o&&e.average>0&&(l=(e.average-o)*7/7700),{currentWeight:n,goalWeight:r,duration:i,weightDifference:s,plannedWeeklyChange:c,estimatedWeeklyChange:l,targetCalories:a,averageCalories:e.average}}function h(e){let t={};e.forEach(e=>{let n=e.date||`unknown`;t[n]||(t[n]={kcal:0,protein:0,carbs:0,fat:0});let r=u(e);t[n].kcal+=r.kcal,t[n].protein+=r.protein,t[n].carbs+=r.carbs,t[n].fat+=r.fat});let n=Object.values(t),r=n.reduce((e,t)=>(e.kcal+=t.kcal,e.protein+=t.protein,e.carbs+=t.carbs,e.fat+=t.fat,e),{kcal:0,protein:0,carbs:0,fat:0});return{total:r,dailyData:t,recordedDays:n.length,average:n.length?r.kcal/n.length:0}}function g(){let t=d(),n=h(t),r=h(f()),a=e(`statTotalCalories`),o=e(`statAverageCalories`),c=e(`statTotalMeals`),l=e(`statRecordedDays`);a&&(a.textContent=i(Math.round(n.total.kcal))),o&&(o.textContent=i(Math.round(n.average))),c&&(c.textContent=i(t.length)),l&&(l.textContent=i(n.recordedDays));let u=e(`statProtein`),p=e(`statCarbs`),m=e(`statFat`);u&&(u.textContent=`${i(n.total.protein,1)} g`),p&&(p.textContent=`${i(n.total.carbs,1)} g`),m&&(m.textContent=`${i(n.total.fat,1)} g`),_(n.average,r.average),v(n),y(n.dailyData),s({...n,mealCount:t.length})}function _(t,r){let o=e(`statCalorieTrend`);if(!o)return;if(!r){o.innerHTML=`
      <span class="statistics-trend neutral">
        ${a(n(`statisticsDynamic.previousPeriodUnavailable`))}
      </span>
    `;return}let s=t-r;o.innerHTML=s>0?`
      <span class="statistics-trend up">
        ↑ ${a(n(`statisticsDynamic.increased`))}
        ${i(Math.round(s))} kcal
      </span>

      <small>
        ${a(n(`statisticsDynamic.comparedPrevious`))}
      </small>
    `:s<0?`
      <span class="statistics-trend down">
        ↓ ${a(n(`statisticsDynamic.decreased`))}
        ${i(Math.abs(Math.round(s)))} kcal
      </span>

      <small>
        ${a(n(`statisticsDynamic.comparedPrevious`))}
      </small>
    `:`
      <span class="statistics-trend neutral">
        → ${a(n(`statisticsDynamic.unchanged`))}
      </span>
    `}function v(t){let r=e(`goalProgressContent`);if(!r)return;let o=m(t);if(!o){r.innerHTML=`
      <p class="statistics-empty-goal">
        ${a(n(`statisticsDynamic.completeProfile`))}
      </p>
    `;return}let s=o.goalWeight<o.currentWeight?n(`statisticsDynamic.lose`):n(`statisticsDynamic.gain`),c=Math.abs(o.weightDifference),l=o.averageCalories-o.targetCalories,u=``;u=Math.abs(l)<50?n(`statisticsDynamic.closeToTarget`):l>0?`
      ${a(n(`statisticsDynamic.aboveTarget`))}
      ${i(Math.round(l))}
      ${a(n(`statisticsDynamic.aboveTargetEnd`))}
    `:`
      ${a(n(`statisticsDynamic.belowTarget`))}
      ${i(Math.abs(Math.round(l)))}
      ${a(n(`statisticsDynamic.belowTargetEnd`))}
    `,r.innerHTML=`
    <div class="statistics-goal-grid">

      <div class="statistics-goal-item">
        <span>${a(n(`statisticsDynamic.currentWeight`))}</span>
        <strong>${i(o.currentWeight,1)} kg</strong>
      </div>

      <div class="statistics-goal-item">
        <span>${a(n(`statisticsDynamic.goalWeight`))}</span>
        <strong>${i(o.goalWeight,1)} kg</strong>
      </div>

      <div class="statistics-goal-item">
        <span>${a(n(`statisticsDynamic.goalChange`))}</span>
        <strong>
          ${a(s)}
          ${i(c,1)} kg
        </strong>
      </div>

      <div class="statistics-goal-item">
        <span>${a(n(`statisticsDynamic.duration`))}</span>
        <strong>
          ${i(o.duration)}
          ${a(n(`statisticsDynamic.months`))}
        </strong>
      </div>

    </div>

    <div class="statistics-goal-calories">
      <span>
        ${a(n(`statisticsDynamic.averageIntake`))}
      </span>

      <strong>
        ${i(Math.round(o.averageCalories))}
        ${a(n(`statisticsDynamic.perDay`))}
      </strong>

      <small>
        ${a(n(`statisticsDynamic.dailyTarget`))}:
        ${i(Math.round(o.targetCalories))}
        ${a(n(`statisticsDynamic.perDay`))}
      </small>
    </div>

    <div class="statistics-goal-status">
      ${u}
    </div>
  `}function y(o){let s=e(`calorieChart`);if(!s)return;let c=Number(Ce())||0,l=t;s.classList.remove(`is-animated`);function u(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function d(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function f(e,t={}){return new Date(`${e}T00:00:00`).toLocaleDateString(r(),{day:`numeric`,month:`short`,...t})}let p=Object.keys(o).filter(e=>Number(o[e]?.kcal)>0).sort(),m=[];if(l===`7`){let e=new Date;for(let t=6;t>=0;t--)m.push(u(d(e,-t)))}else if(l===`30`){let e=u(d(new Date,-29));m=p.filter(t=>t>=e).slice(-30)}else m=p.slice(-30);let h=m.map(e=>{let t=Object.prototype.hasOwnProperty.call(o,e);return{date:e,kcal:t&&Number(o[e].kcal)||0,hasData:t}});if(l!==`7`&&!h.length){s.innerHTML=`
      <p>${a(n(`statisticsDynamic.noData`))}</p>
    `;return}let g=h.filter(e=>e.hasData).map(e=>e.kcal),_=Math.max(...g,c,1);if(l===`7`){let e=_*1.12,t=c>0?c/e*100:0;s.innerHTML=`
      <div class="statistics-chart-wrapper statistics-bar-view">

        ${c>0?`
          <div
            class="statistics-target-line"
            style="bottom: ${t}%"
          >
            <span>
              ${a(n(`statisticsDynamic.targetLabel`))}
              ${i(Math.round(c))} kcal
            </span>
          </div>
        `:``}

        <div class="statistics-chart-bars">
          ${h.map(t=>{let r=t.kcal??0,o=t.hasData?Math.max(0,r/e*100):0,s=c>0&&t.hasData&&r<=c,l=c>0&&t.hasData&&r>c,u=``;s?u=`success`:l&&(u=`over-target`);let d=n(s?`statisticsDynamic.according`:`statisticsDynamic.exceeded`),p=t.hasData?s?n(`statisticsDynamic.successful`):l?n(`statisticsDynamic.exceededTarget`):``:`Belum ada catatan`;return`
              <div class="statistics-chart-column">

                <strong
                  data-chart-value="${r}"
                  class="${t.hasData?``:`no-data`}"
                >
                  ${t.hasData?i(Math.round(r)):`—`}
                </strong>

                <div class="statistics-bar-track">
                  <div
                    class="statistics-bar ${u}"
                    style="height: ${o}%"
                    title="${a(p)}"
                  ></div>
                </div>

                <small>${f(t.date)}</small>

                ${c>0?`
                  <span class="statistics-day-status">
                    ${t.hasData?s?`✓`:`↑`:`—`}
                    ${t.hasData?a(d):`—`}
                  </span>
                `:``}

              </div>
            `}).join(``)}
        </div>
      </div>
    `}else{let e=l===`30`?720:Math.max(720,h.length*22),t=e-48-16,n=_*1.15;function r(e){return h.length<=1?48:48+e/(h.length-1)*t}function o(e){return 202-e/n*177}let u=[],d=[];h.forEach((e,t)=>{e.hasData?d.push({x:r(t),y:o(e.kcal),item:e}):d.length&&(u.push(d),d=[])}),d.length&&u.push(d);function p(e){if(!e.length)return``;if(e.length===1){let t=e[0];return`M ${t.x} ${t.y}`}let t=`M ${e[0].x} ${e[0].y}`;for(let n=0;n<e.length-1;n++){let r=e[n],i=e[n+1],a=(r.x+i.x)/2;t+=`
      C ${a} ${r.y},
        ${a} ${i.y},
        ${i.x} ${i.y}
    `}return t}let m=u.map(e=>({line:p(e),area:`
    ${p(e)}
    L ${e[e.length-1].x} 202
    L ${e[0].x} 202
    Z
  `}));h.map((e,t)=>e.hasData?`
          <circle
            class="statistics-line-point"
            cx="${r(t)}"
            cy="${o(e.kcal)}"
            r="4"
          >
            <title>
              ${a(f(e.date,{year:`numeric`}))}
              — ${i(Math.round(e.kcal))} kcal
            </title>
          </circle>
        `:``).join(``);let g=l===`30`?5:Math.max(1,Math.ceil(h.length/12)),v=h.map((e,t)=>{let n=t===h.length-1;return t%g!==0&&!n?``:`
          <text
            class="statistics-line-date"
            x="${r(t)}"
            y="228"
            text-anchor="middle"
          >
            ${a(f(e.date))}
          </text>
        `}).join(``),y=[0,.5,1].map(t=>{let r=25+177*(1-t),a=n*t;return`
        <line
          class="statistics-line-grid"
          x1="48"
          y1="${r}"
          x2="${e-16}"
          y2="${r}"
        />

        <text
          class="statistics-line-axis"
          x="38"
          y="${r+4}"
          text-anchor="end"
        >
          ${i(Math.round(a))}
        </text>
      `}).join(``),b=c>0?`
        <line
          class="statistics-line-target"
          x1="48"
          y1="${o(c)}"
          x2="${e-16}"
          y2="${o(c)}"
        />
        <text
          class="statistics-line-target-label"
          x="${e-16-4}"
          y="${o(c)-8}"
          text-anchor="end"
        >
          Target ${i(Math.round(c))} kcal
        </text>
      `:``;s.innerHTML=`
      <div class="statistics-line-wrapper">

        <div class="statistics-line-scroll">
          
<svg
  class="statistics-line-chart"
  viewBox="0 0 ${e} 240"
  style="width: ${l===`30`?`100%`:`${e}px`}; height: auto;"
  role="img"
  aria-label="Grafik tren konsumsi kalori"
>
  <defs>
    <!-- Gradasi area -->
    <linearGradient
      id="calorieAreaGradient"
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop
        offset="0%"
        stop-color="#16A085"
        stop-opacity="0.32"
      />
      <stop
        offset="65%"
        stop-color="#16A085"
        stop-opacity="0.10"
      />
      <stop
        offset="100%"
        stop-color="#16A085"
        stop-opacity="0.01"
      />
    </linearGradient>

    <!-- Efek glow -->
    <filter
      id="calorieLineGlow"
      x="-30%"
      y="-30%"
      width="160%"
      height="160%"
    >
      <feGaussianBlur
        stdDeviation="3"
        result="blur"
      />
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Grid -->
  ${y}

  <!-- Target -->
  ${b}

  <!-- Area gradient -->
  ${m.map(e=>`
    <path
      class="statistics-line-area"
      d="${e.area}"
      fill="url(#calorieAreaGradient)"
    />
  `).join(``)}

  <!-- Garis utama -->
  ${m.map(e=>`
    <path
      class="statistics-line-path"
      d="${e.line}"
      filter="url(#calorieLineGlow)"
    />
  `).join(``)}

  <!-- Titik data -->
  ${h.map((e,t)=>{if(!e.hasData)return``;let n=r(t),s=o(e.kcal);return`
      <g class="statistics-line-marker">
        <circle
          class="statistics-line-point-halo"
          cx="${n}"
          cy="${s}"
          r="10"
        />

        <circle
          class="statistics-line-point"
          cx="${n}"
          cy="${s}"
          r="4.5"
        >
          <title>
            ${a(f(e.date,{year:`numeric`}))}
            — ${i(Math.round(e.kcal))} kcal
          </title>
        </circle>
      </g>
    `}).join(``)}

  <!-- Tanggal -->
  ${v}
</svg>

        </div>

        <div class="statistics-line-legend">
          <span>
            <i class="statistics-legend-dot"></i>
            Kalori harian
          </span>

          ${c>0?`
            <span>
              <i class="statistics-legend-target"></i>
              Target kalori
            </span>
          `:``}
        </div>

      </div>
    `}s.getBoundingClientRect(),requestAnimationFrame(()=>{requestAnimationFrame(()=>{s.classList.add(`is-animated`)})})}function b(){let e=document.getElementById(`statisticsPeriodSelect`);e&&(e.value=t,e.onchange=()=>{let n=e.value;[`7`,`30`,`all`].includes(n)&&(t=n,g())}),document.addEventListener(`kaloriku:pagechange`,e=>{e.detail?.pageId===`statisticsPage`&&g()}),window.addEventListener(`languageChanged`,()=>{g()}),g()}b()})),Lt=r((()=>{var e=[`homePage`,`historyPage`,`profilePage`,`statisticsPage`];function t(){let t=document.querySelector(`.bottom-nav`),n=Array.from(document.querySelectorAll(`.nav-item`)),r=t?.querySelector(`.nav-indicator`);if(!t||!n.length)return;let i=window.matchMedia(`(prefers-reduced-motion: reduce)`),a=e.find(e=>{let t=document.getElementById(e);return t&&!t.hidden})||`homePage`;function o(e,a=!0){let o=n.indexOf(e);o<0||(t.style.setProperty(`--active-index`,o),r&&(a&&!i.matches?t.classList.add(`is-moving`):t.classList.remove(`is-moving`)))}function s(t){let n=document.getElementById(t);n&&t!==a&&(a=t,e.forEach(e=>{let n=document.getElementById(e);n&&(e===t?(n.hidden=!1,n.classList.remove(`page-enter`),n.offsetWidth,i.matches||n.classList.add(`page-enter`)):(n.hidden=!0,n.classList.remove(`page-enter`)))}),i.matches||n.addEventListener(`animationend`,function e(t){t.target===n&&(n.classList.remove(`page-enter`),n.removeEventListener(`animationend`,e))}),document.dispatchEvent(new CustomEvent(`kaloriku:pagechange`,{detail:{pageId:t}})),window.scrollTo({top:0,behavior:i.matches?`instant`:`smooth`}))}let c=t.querySelector(`.nav-item.active`)||n[0];n.forEach(e=>{let t=e.dataset.page===a;e.classList.toggle(`active`,t),t?e.setAttribute(`aria-current`,`page`):e.removeAttribute(`aria-current`)}),o(c,!1),n.forEach(t=>{t.addEventListener(`click`,()=>{let r=t.dataset.page;e.includes(r)&&document.getElementById(r)&&(n.forEach(e=>{let n=e===t;e.classList.toggle(`active`,n),n?e.setAttribute(`aria-current`,`page`):e.removeAttribute(`aria-current`)}),o(t),s(r))})})}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,t,{once:!0}):t()}));function Rt(){try{return JSON.parse(localStorage.getItem(`kaloriku_user`)||`{}`)}catch(e){return console.error(`Gagal membaca data pengguna:`,e),{}}}function zt(){return new Promise((e,t)=>{let n=()=>{};n=h(o,t=>{n(),e(t||null)},e=>{n(),t(e)})})}async function Bt(){let e=Rt();if(e.uid===`guest`&&e.loginMethod===`guest`)return{type:`guest`,uid:`guest`};try{let e=await zt();return e?{type:`google`,uid:e.uid}:null}catch(e){return console.error(`Gagal memeriksa autentikasi:`,e),null}}function Vt(e){return`${qt}${e}`}function Ht(e){try{let t=JSON.parse(localStorage.getItem(Vt(e))||`{}`);return t.completed===!0&&Number(t.version)>=V}catch{return!1}}function Ut(e){try{localStorage.setItem(Vt(e),JSON.stringify({completed:!0,version:V}))}catch(e){console.error(`Gagal menyimpan cache onboarding:`,e)}}async function Wt(){let e=await Bt();if(!e)return!1;if(e.type===`guest`)try{let e=JSON.parse(localStorage.getItem(Kt)||`{}`);return e.completed===!0&&Number(e.version)>=V}catch{return!1}let t=Ht(e.uid);try{let r=l(n,`users`,e.uid,`onboarding`,`status`),i=await u(r);if(!i.exists())return t;let a=i.data(),o=a.completed===!0&&Number(a.version)>=V;return o&&Ut(e.uid),o}catch(e){return console.error(`Gagal mengambil status onboarding dari Firestore:`,e),t}}async function Gt(){let e=await Bt();if(!e)return console.error(`Session pengguna tidak ditemukan.`),!1;if(e.type===`guest`)try{return localStorage.setItem(Kt,JSON.stringify({completed:!0,version:V,completedAt:new Date().toISOString()})),!0}catch(e){return console.error(`Gagal menyimpan onboarding Guest:`,e),!1}Ut(e.uid);try{let t=l(n,`users`,e.uid,`onboarding`,`status`);return await p(t,{completed:!0,version:V,completedAt:f()},{merge:!0}),console.log(`Status onboarding berhasil disimpan ke Firestore.`),!0}catch(e){return console.error(`Gagal menyimpan onboarding ke Firestore:`,e),!1}}var V,Kt,qt,Jt=a((()=>{i(),V=1,Kt=`kaloriku_onboarding_guest`,qt=`kaloriku_onboarding_google_`}));function Yt(e,t){let n=document.createElement(`article`);return n.className=`onboarding-slide`,n.dataset.slide=t,n.innerHTML=`
    <div class="onboarding-illustration onboarding-${e.visual}">
      <div class="onboarding-illustration-glow"></div>
      <div class="onboarding-illustration-icon">
        ${e.icon}
      </div>
    </div>

    <div class="onboarding-slide-content">
      <h1 class="onboarding-slide-title">
        ${ln(e.title)}
      </h1>

      <p class="onboarding-slide-description">
        ${ln(e.description)}
      </p>
    </div>
  `,n}function Xt(){sn&&(sn.querySelectorAll(`.onboarding-slide`).forEach((e,t)=>{e.classList.toggle(`active`,t===U),e.setAttribute(`aria-hidden`,t!==U)}),Zt())}function Zt(){if(!W)return;let e=W.querySelector(`#onboardingBack`),t=W.querySelector(`#onboardingNext`),n=W.querySelector(`#onboardingSkip`),r=W.querySelectorAll(`.onboarding-dot`);e&&(e.disabled=U===0,e.hidden=U===0),t&&(t.textContent=U===H.length-1?ln(`start`):ln(`next`)),n&&(n.textContent=ln(`skip`)),r.forEach((e,t)=>{e.classList.toggle(`active`,t===U),e.setAttribute(`aria-current`,t===U?`step`:`false`)});let i=W.querySelector(`#onboardingCounter`);i&&(i.textContent=`${U+1} / ${H.length}`)}function Qt(){U<H.length-1?(U++,Xt()):cn.onComplete?.()}function $t(){U>0&&(U--,Xt())}function en(){cn.onSkip?.()}function tn(){let e=document.createElement(`div`);return e.id=`kalorikuOnboarding`,e.className=`onboarding-overlay`,e.innerHTML=`
    <div class="onboarding-shell">

      <header class="onboarding-header">
        <div class="onboarding-brand">
  <div class="onboarding-brand-mark">
    <img src="./assets/rovixa-icon.png" alt="Rovixa" />
  </div>
  <span>Kalori SehatKu</span>
</div>

        <button
          type="button"
          class="onboarding-skip"
          id="onboardingSkip"
        ></button>
      </header>

      <main class="onboarding-main">

        <div
          class="onboarding-slides"
          id="onboardingSlides"
        ></div>

        <div class="onboarding-progress">

          <div
            class="onboarding-dots"
            id="onboardingDots"
          >
            ${H.map((e,t)=>`
              <button
                type="button"
                class="onboarding-dot"
                data-slide-target="${t}"
                aria-label="${ln(`slide`)} ${t+1}"
              ></button>
            `).join(``)}
          </div>

          <span id="onboardingCounter">
            1 / ${H.length}
          </span>

        </div>

      </main>

      <footer class="onboarding-footer">

        <button
          type="button"
          id="onboardingBack"
          class="onboarding-back"
        ></button>

        <button
          type="button"
          id="onboardingNext"
          class="onboarding-next"
        ></button>

      </footer>

    </div>
  `,e}function nn(){let e=W.querySelector(`#onboardingBack`),t=W.querySelector(`#onboardingNext`),n=W.querySelector(`#onboardingSkip`);e.addEventListener(`click`,$t),t.addEventListener(`click`,Qt),n.addEventListener(`click`,en),W.querySelectorAll(`.onboarding-dot`).forEach(e=>{e.addEventListener(`click`,()=>{U=Number(e.dataset.slideTarget),Xt()})}),W.addEventListener(`keydown`,e=>{e.key===`ArrowRight`&&Qt(),e.key===`ArrowLeft`&&$t()})}function rn(){if(!W)return;let e=W.querySelector(`#onboardingSlides`);e&&(e.innerHTML=``,H.forEach((t,n)=>{e.appendChild(Yt(t,n))}),Xt())}function an({onComplete:e,onSkip:t}={}){W||(U=0,cn={onComplete:e,onSkip:t},W=tn(),sn=W.querySelector(`#onboardingSlides`),H.forEach((e,t)=>{sn.appendChild(Yt(e,t))}),document.body.appendChild(W),nn(),Xt(),requestAnimationFrame(()=>{W.classList.add(`visible`)}),window.addEventListener(`languageChanged`,rn))}function on(){if(!W)return;let e=W;e.classList.remove(`visible`),window.removeEventListener(`languageChanged`,rn),setTimeout(()=>{e.remove(),W=null,sn=null,cn={}},350)}var H,U,sn,W,cn,ln,un=a((()=>{H=[{icon:`🥗`,title:`welcomeTitle`,description:`welcomeDescription`,visual:`nutrition`},{icon:`🍱`,title:`foodTitle`,description:`foodDescription`,visual:`food`},{icon:`📸`,title:`aiTitle`,description:`aiDescription`,visual:`ai`},{icon:`🎯`,title:`goalTitle`,description:`goalDescription`,visual:`goal`}],U=0,sn=null,W=null,cn={},ln=e=>window.t?.(`onboarding.slides.${e}`)??e}));function dn(){let e=document.createElement(`div`);return e.id=`kalorikuGuidedTour`,e.className=`guided-tour-overlay`,e.innerHTML=`
    <div
      class="guided-tour-highlight"
      id="guidedTourHighlight"
    ></div>

    <section
      class="guided-tour-tooltip"
      id="guidedTourTooltip"
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-labelledby="guidedTourTitle"
    >
      <div class="guided-tour-header">
        <span class="guided-tour-brand">
          KALORIKU GUIDE
        </span>

        <button
          type="button"
          class="guided-tour-close"
          id="guidedTourClose"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div class="guided-tour-counter">
        <span id="guidedTourStep"></span>

        <div class="guided-tour-progress">
          <div
            id="guidedTourProgress"
            class="guided-tour-progress-fill"
          ></div>
        </div>
      </div>

      <h3 id="guidedTourTitle"></h3>

      <p id="guidedTourDescription"></p>

      <div class="guided-tour-actions">

        <button
          type="button"
          id="guidedTourBack"
          class="guided-tour-back"
        ></button>

        <button
          type="button"
          id="guidedTourNext"
          class="guided-tour-next"
        ></button>

      </div>
    </section>
  `,e}function fn(e){let t=document.querySelector(e);return!t||t.closest(`main`)?.hidden===!0||t.getClientRects().length===0?null:t}function pn(e,t=5e3){return new Promise(n=>{let r=Date.now();function i(){let a=fn(e);a?n(a):Date.now()-r>=t?n(null):requestAnimationFrame(i)}i()})}async function mn(e){let t=document.getElementById(e);if(t&&!t.hidden&&t.getClientRects().length>0)return!0;let n=document.querySelector(`.nav-item[data-page="${e}"]`);return n?(n.click(),await new Promise(e=>{let t=!1,n=()=>{t||(t=!0,window.removeEventListener(`kaloriku:pagechange`,n),e())};window.addEventListener(`kaloriku:pagechange`,n),setTimeout(n,1200)}),await new Promise(e=>{requestAnimationFrame(()=>{requestAnimationFrame(e)})}),!0):(console.warn(`Tombol navigasi tidak ditemukan:`,e),!1)}function hn(e){if(!e||!Y)return;let t=e.getBoundingClientRect(),n=Math.max(4,t.top-8),r=Math.max(4,t.left-8),i=Math.min(t.width+16,window.innerWidth-r-4),a=Math.min(t.height+16,window.innerHeight-n-4);Y.style.top=`${n}px`,Y.style.left=`${r}px`,Y.style.width=`${i}px`,Y.style.height=`${a}px`,Y.style.borderRadius=getComputedStyle(e).borderRadius||`14px`,gn(t)}function gn(e){if(!X)return;let t=Math.min(350,window.innerWidth-32);X.style.width=`${t}px`;let n=X.offsetHeight||220,r=G[q],i=window.innerHeight-e.bottom-18-16,a=e.top-18-16,o=r.placement;o===`bottom`&&i<n&&a>i&&(o=`top`),o===`top`&&a<n&&i>a&&(o=`bottom`);let s=o===`top`?e.top-n-18:e.bottom+18;(s<16||s+n>window.innerHeight-16)&&(s=Math.max(16,(window.innerHeight-n)/2));let c=e.left+e.width/2-t/2;c=Math.max(16,Math.min(c,window.innerWidth-t-16)),X.style.top=`${s}px`,X.style.left=`${c}px`}function _n(){if(!X)return;let e=G[q],t=X.querySelector(`#guidedTourTitle`),n=X.querySelector(`#guidedTourDescription`),r=X.querySelector(`#guidedTourStep`),i=X.querySelector(`#guidedTourProgress`),a=X.querySelector(`#guidedTourBack`),o=X.querySelector(`#guidedTourNext`);t&&(t.textContent=K(e.title)),n&&(n.textContent=K(e.description)),r&&(r.textContent=`${K(`step`)} ${q+1} ${K(`of`)} ${G.length}`),i&&(i.style.width=`${(q+1)/G.length*100}%`),a&&(a.textContent=K(`back`),a.hidden=q===0),o&&(o.textContent=q===G.length-1?K(`finish`):K(`next`))}async function vn(e){if(!J||e<0||e>=G.length)return;q=e;let t=G[q];if(_n(),await mn(t.page),!J)return;let n=await pn(t.target);J&&(n?(Z=n,n.scrollIntoView({behavior:`smooth`,block:`center`,inline:`nearest`}),await new Promise(e=>{setTimeout(e,350)}),J&&(hn(n),X.classList.add(`visible`))):(console.warn(`Target guided tour tidak ditemukan:`,t.target),q<G.length-1?await vn(q+1):xn()))}async function yn(){q<G.length-1?(X.classList.remove(`visible`),await vn(q+1)):xn()}async function bn(){q<=0||(X.classList.remove(`visible`),await vn(q-1))}async function xn(){if(!J)return;let e=document.querySelector(`.nav-item[data-page="homePage"]`);e&&(e.click(),await new Promise(e=>{setTimeout(e,400)})),En.onComplete?.(),Tn()}function Sn(){J&&(En.onSkip?.(),Tn())}function Cn(){let e=J.querySelector(`#guidedTourNext`),t=J.querySelector(`#guidedTourBack`),n=J.querySelector(`#guidedTourClose`);e.addEventListener(`click`,yn),t.addEventListener(`click`,bn),n.addEventListener(`click`,Sn),Dn=()=>{Z&&hn(Z)},On=()=>{Z&&hn(Z)},kn=()=>{_n(),Z&&hn(Z)},window.addEventListener(`resize`,Dn),window.addEventListener(`scroll`,On,!0),window.addEventListener(`languageChanged`,kn)}async function wn({onComplete:e,onSkip:t}={}){J||(En={onComplete:e,onSkip:t},q=0,J=dn(),Y=J.querySelector(`#guidedTourHighlight`),X=J.querySelector(`#guidedTourTooltip`),document.body.appendChild(J),Cn(),requestAnimationFrame(()=>{J?.classList.add(`visible`)}),await vn(0))}function Tn(){if(!J)return;let e=J;e.classList.remove(`visible`),window.removeEventListener(`resize`,Dn),window.removeEventListener(`scroll`,On,!0),window.removeEventListener(`languageChanged`,kn),setTimeout(()=>{e.remove(),J=null,Y=null,X=null,Z=null,Dn=null,On=null,kn=null,En={}},300)}var G,K,q,J,Y,X,En,Z,Dn,On,kn,An=a((()=>{G=[{page:`homePage`,target:`.dashboard-calorie`,title:`calorieTitle`,description:`calorieDescription`,placement:`bottom`},{page:`homePage`,target:`.dashboard-nutrition`,title:`nutritionTitle`,description:`nutritionDescription`,placement:`bottom`},{page:`homePage`,target:`.dashboard-scan`,title:`scanTitle`,description:`scanDescription`,placement:`top`},{page:`historyPage`,target:`#fullHistoryList`,title:`historyTitle`,description:`historyDescription`,placement:`bottom`},{page:`statisticsPage`,target:`#calorieChart`,title:`statisticsTitle`,description:`statisticsDescription`,placement:`top`},{page:`profilePage`,target:`.profile-identity`,title:`profileTitle`,description:`profileDescription`,placement:`bottom`}],K=e=>window.t?.(`onboarding.tour.${e}`)??e,q=0,J=null,Y=null,X=null,En={},Z=null,Dn=null,On=null,kn=null})),jn=r((()=>{Jt(),un(),An();var e=!1,t=!1,n=!1;function r(){return window.__kalorikuAuthState?.ready?Promise.resolve(window.__kalorikuAuthState):new Promise(e=>{window.addEventListener(`kaloriku:authready`,t=>e(t.detail),{once:!0})})}async function i(){if(!n){n=!0,on(),Tn();try{await Gt(),console.log(`KaloriKu onboarding selesai.`)}catch(e){console.error(`Gagal menyimpan status onboarding:`,e)}}}function a(){t||n||(t=!0,wn({onComplete:i,onSkip:i}))}function o(){an({onComplete:()=>{on(),a()},onSkip:()=>{on(),a()}})}async function s(){if(!e){e=!0;try{if(await r(),await Wt()){console.log(`Onboarding sudah pernah diselesaikan.`);return}await new Promise(e=>{setTimeout(e,500)}),o()}catch(e){console.error(`Inisialisasi onboarding gagal:`,e)}}}s()})),Mn=r((()=>{i();function e(e){return window.t?window.t(e):e}var t=document.getElementById(`logoutButton`);function n(){Object.keys(localStorage).forEach(e=>{e.startsWith(`kaloriku_`)&&localStorage.removeItem(e)}),console.log(`Data lokal KaloriKu berhasil dibersihkan.`)}t?.addEventListener(`click`,async()=>{if(await window.confirmAppModal({type:`warning`,title:e(`identity.logoutTitle`),message:e(`identity.logoutMessage`),confirmText:e(`identity.logoutConfirm`),cancelText:e(`identity.logoutCancel`)}))try{t.disabled=!0,t.textContent=e(`identity.logoutLoading`),await g(o),n(),window.location.replace(`./login.html`)}catch(n){console.error(`Logout gagal:`,n),window.showAppModal({type:`error`,title:e(`identity.logoutFailedTitle`),message:e(`identity.logoutFailedMessage`)}),t.disabled=!1,t.innerHTML=`<span aria-hidden="true">↪</span> `+e(`identity.logout`)}})}));y(),b(),wt(),Tt(),Ft(),It(),Lt(),jn(),Mn();var Q=document.getElementById(`appModal`),Nn=document.getElementById(`appModalIcon`),Pn=document.getElementById(`appModalTitle`),Fn=document.getElementById(`appModalMessage`),In=document.getElementById(`appModalCancel`),Ln=document.getElementById(`appModalConfirm`),Rn=Q?.querySelector(`.app-modal-backdrop`),zn={success:{icon:`✓`,title:()=>window.t(`modal.success`)},error:{icon:`✕`,title:()=>window.t(`modal.error`)},warning:{icon:`⚠`,title:()=>window.t(`modal.warning`)},info:{icon:`i`,title:()=>window.t(`modal.info`)}},Bn=null,Vn=``;function $(e=!1){if(Q&&(Q.hidden=!0,document.body.style.overflow=Vn,Bn)){let t=Bn;Bn=null,t(e)}}function Hn({type:e=`info`,title:t,message:n=``,confirmText:r,onConfirm:i}={}){if(!Q){console.warn(`Global modal tidak ditemukan.`);return}$(!1);let a=zn[e]||zn.info;Q.dataset.type=e,Nn.textContent=a.icon,Pn.textContent=t||a.title(),Fn.textContent=n,In.hidden=!0,Ln.textContent=r||window.t(`modal.ok`),Vn=document.body.style.overflow,document.body.style.overflow=`hidden`,Q.hidden=!1,Ln.onclick=()=>{$(),typeof i==`function`&&i()}}function Un({type:e=`warning`,title:t,message:n=``,confirmText:r,cancelText:i}={}){if(!Q)return console.warn(`Global modal tidak ditemukan.`),Promise.resolve(!1);$(!1);let a=zn[e]||zn.warning;return Q.dataset.type=e,Nn.textContent=a.icon,Pn.textContent=t||a.title(),Fn.textContent=n,In.hidden=!1,In.textContent=i||window.t(`modal.cancel`),Ln.textContent=r||window.t(`modal.yes`),Vn=document.body.style.overflow,document.body.style.overflow=`hidden`,Q.hidden=!1,new Promise(e=>{Bn=e,Ln.onclick=()=>{$(!0)},In.onclick=()=>{$(!1)}})}Rn?.addEventListener(`click`,()=>{$(!1)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&Q&&!Q.hidden&&$(!1)}),window.showAppModal=Hn,window.confirmAppModal=Un,window.closeAppModal=$;