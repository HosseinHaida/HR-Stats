const errMessages = {
  invalidPassword: 'رمز عبور اشتباه است',
  invalidCredentials: 'اطلاعات ورودی نامعتبر',
  enterValidPassword: 'رمز عبور معتبر وارد کنید',
  couldNotFetchUser: 'استخراج ناموفق کاربر',
  userNotFound: 'کاربر یافت نشد',
  operationFailed: 'عملیات ناموفق',
  userAuthorizationFailed: 'عملیات احراز هویت ناموفق',
  peopleFetchFailed: 'خطا در دریافت لیست پرسنل',
  authFailed: 'خطا در احراز هویت',
  notAuthorizedToInsertPersonnel: 'شما مجوز افزودن پرسنل را ندارید',
  uploadFailed: 'آپلود ناموفق',
  errWhileUpload: 'خطا در آپلود فایل',
  failedSavingExcel: 'زخیره فایل ناموفق',
  failedSavingPhoto: 'زخیره تصویر ناموفق',
  emptyFields: 'لطفا فیلدهای خالی را پر کنید',
  personInsertFailed: 'خطا در ایجاد پرسنل در پایگاه داده',
  fillSoldiersNID: 'کد ملی وظیفه را وارد نمایید',
  notAuthorizedToInsertUser: 'شما مجوز افزودن کاربر را ندارید',
  userInsertFailed: 'خطا در ایجاد کاربر در پایگاه داده',
  userPerNoDubplicate: 'کد پرسنلی تکراری',
  personPerNoDubplicate: 'کد پرسنلی تکراری',
  emptyFieldsDetected: 'فیلد/های خالی',
  authDeleteFailed: 'حذف نقش با خطا مواجه شد',
  permissionDeniedOnAuthDelete: 'شما مجوذ حذف نقش در قسمت مربوطه را ندارید',
  noPermittedDepartments: 'شما مجوز مشاهده پرسنل قسمتی را ندارید',
  userHasNoAuth: 'عدم وجود مجوز ثبت آمار',
  userIsNotAuthedForThisDep: 'عدم وجود مجوز برای ثبت آمار قسمت مربوطه',
  notAuthorizedToChangeDep: 'شما مجاز به تغییر قسمت شخص نیستید',
  notAuthorizedToChangeShobe: 'شما مجاز به تغییر شعبه شخص نیستید',
  canOnlyUnsetPersonDep: 'شما تنها مجاز به کسر پرسنل از قسمت خود هستید',
  noAuthFound: 'مجوزی برای شما یافت نشد، با ادمین تماس بگیرید',
  noAuthInDepToChangeDep: 'شما در این قسمت مجوز تغییر قسمت پرسنل را ندارید',
  noAuthInDepToChangeShobe: 'شما در این قسمت مجوز تغییر شعبه پرسنل را ندارید',
  couldNotUpdatePersonDep: 'عملیات تغییر قسمت با خطا مواجه شد',
  couldNotUpdatePersonShobe: 'عملیات تغییر شعبه با خطا مواجه شد',
  couldNotFetchPerson: 'استخراج ناموفق پرسنل',
  personNotFound: 'پرسنل یافت نشد',
  metaFetchForDastoorFailed: 'استخراج اطلاعات ماده دستور با خطا مواجه شد.',
  notPermittedToUploadDastoor: 'عدم وجود مجوز برای بارگذاری گروهی ماده دستور',
  notInHR: 'تنها پرسنل نیروی انسانی مجوز این کار را دارند',
  authFetchFailed: 'خطا در واکشی مجوزها',
  personWithPerNo: 'فرد با شماره پرسنلی ',
  excelImportFailedAtSomePoint: 'ورود اطلاعات از فایل اکسل با مشکل مواجه شد',
  notAuthorized: 'عدم وجود مجوز',
  dayOffInsertFailed: 'ثبت مرخصی با خطا مواجه شد',
  daysOffFetchFailed: 'واکشی مرخصی‌ها با خطا مواجه شد',
  statsInsertFailed: 'درج آمار روزانه با مشکل مواجه شد',
  statsAlreadyInserted: 'آمار امروز برای این قسمت یکبار ثبت شده است',
  statsFetchFailed: 'خواندن اطلاعات آمار با خطا مواجه شد',
  approveFailed: 'تایید آمار روزانه با خطا مواجه شد',
  alreadyApproved: 'قبلا تایید شده است',
  fetchingHolidaysFailed: 'استخراج روزهای تعطیل با خطا مواجه شد',
  missionInsertFailed: 'ایجاد ماموریت با خطا مواجه شد',
  agentInsertionFailed: 'ثبت مامور با خطا مواجه شد',
  updatePassFailed: 'فرایند ویرایش رمز عبور با خطا مواجه شد',
};

module.exports = { errMessages };
