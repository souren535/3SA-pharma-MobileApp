import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Platform,
  Image, TextInput, Modal, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const STEPS = ['Personal', 'Address', 'Legal', 'Review'];

const SHOP_TYPES = ['Retail', 'Wholesaler'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

// ─── Input Component ─────────────────────────────────
const InputField = ({
  label, value, onChangeText, placeholder, required = false,
  keyboardType = 'default' as any, multiline = false, maxLength, prefix,
  editable = true, loading = false,
}: any) => (
  <View className="mb-4">
    <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">
      {label}{required ? ' *' : ''}
    </Text>
    <View className={`flex-row items-center rounded-xl border border-gray-100 ${editable ? 'bg-gray-50' : 'bg-gray-100'}`}>
      {prefix && (
        <Text className="pl-3.5 text-[14px] font-semibold text-gray-600">{prefix}</Text>
      )}
      <TextInput
        className={`flex-1 p-3.5 text-[14px] ${editable ? 'text-gray-800' : 'text-gray-500'}`}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        style={multiline ? { minHeight: 60, textAlignVertical: 'top' } : undefined}
      />
      {loading && (
        <View className="pr-3.5">
          <ActivityIndicator size="small" color="#1A3F75" />
        </View>
      )}
    </View>
  </View>
);

// ─── Dropdown Component ───────────────────────────────
const DropdownField = ({ label, value, onPress, placeholder, required = false, disabled = false }: any) => (
  <View className="mb-4">
    <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">
      {label}{required ? ' *' : ''}
    </Text>
    <TouchableOpacity
      className={`flex-row items-center justify-between rounded-xl border border-gray-100 p-3.5 ${disabled ? 'bg-gray-100' : 'bg-gray-50'}`}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text className={`text-[14px] ${value ? (disabled ? 'text-gray-500 font-medium' : 'text-gray-800 font-medium') : 'text-gray-400'}`}>
        {value || placeholder}
      </Text>
      {!disabled && <Ionicons name="chevron-down" size={18} color="#9CA3AF" />}
    </TouchableOpacity>
  </View>
);

// ─── Review Item ──────────────────────────────────────
const ReviewItem = ({ label, value }: { label: string; value: string }) => (
  <View className="py-2.5 border-b border-gray-50">
    <Text className="text-xs text-gray-500 mb-1">{label}</Text>
    <Text className="text-[13px] font-bold text-gray-800" numberOfLines={2}>
      {value || '—'}
    </Text>
  </View>
);

export default function CreateStoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 – Personal
  const [storeImages, setStoreImages] = useState<string[]>([]);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [shopType, setShopType] = useState('');
  const [showShopTypePicker, setShowShopTypePicker] = useState(false);

  // Step 2 – Address
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [pin, setPin] = useState('');
  const [state, setState] = useState('');
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [loadingPin, setLoadingPin] = useState(false);

  const handlePinChange = async (text: string) => {
    const pinCode = text.replace(/[^0-9]/g, '');
    setPin(pinCode);
    if (pinCode.length === 6) {
      setLoadingPin(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
        const data = await response.json();
        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setDistrict(po.District);
          setState(po.State);
          setCity(po.Block && po.Block !== 'NA' ? po.Block : po.District);
        } else {
          showPopup('Error', 'Invalid PIN Code. Please enter a valid Indian PIN.');
        }
      } catch (error) {
        console.error('Error fetching pin details:', error);
      } finally {
        setLoadingPin(false);
      }
    }
  };

  // Step 3 – Legal
  const [licenseNo, setLicenseNo] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');

  // Image source picker
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  // Popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const showPopup = (title: string, message: string) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  // Image handling
  const pickFromGallery = async () => {
    setShowImageSourceModal(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setStoreImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const takePhoto = async () => {
    setShowImageSourceModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showPopup('Permission Denied', 'Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setStoreImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setStoreImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation per step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!shopName.trim()) { showPopup('Required', 'Please enter the shop name.'); return false; }
        if (!ownerName.trim()) { showPopup('Required', 'Please enter the owner name.'); return false; }
        if (!contact.trim() || contact.length < 10) { showPopup('Required', 'Please enter a valid 10-digit contact number.'); return false; }
        if (!shopType) { showPopup('Required', 'Please select a shop type.'); return false; }
        return true;
      case 1:
        if (!address1.trim()) { showPopup('Required', 'Please enter Address Line 1.'); return false; }
        if (!city.trim()) { showPopup('Required', 'Please enter the city.'); return false; }
        if (!district.trim()) { showPopup('Required', 'Please enter the district.'); return false; }
        if (!pin.trim() || pin.length !== 6) { showPopup('Required', 'Please enter a valid 6-digit PIN code.'); return false; }
        if (!state) { showPopup('Required', 'Please select the state.'); return false; }
        return true;
      case 2:
        return true; // Legal is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    const payload = {
      images: storeImages, shopName, ownerName,
      contact: `+91 ${contact}`, email, shopType,
      address1, address2, city, district, pin, state,
      licenseNo, fssaiLicense, gstNumber, panNumber,
    };
    console.log('Create Store Payload:', payload);
    showPopup('Success', 'Store created successfully!');
    // Navigate back after popup is dismissed — handled in popup OK
  };



  // ─── STEP RENDERERS ───────────────────────────────────
  const renderStep1 = () => (
    <>
      {/* Store Images */}
      <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Store Images</Text>
      <View className="flex-row flex-wrap mb-5">
        {storeImages.map((uri, index) => (
          <View key={index} className="mr-2 mb-2 relative">
            <Image source={{ uri }} className="w-20 h-20 rounded-xl bg-gray-200" resizeMode="cover" />
            <TouchableOpacity
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={12} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 items-center justify-center"
          onPress={() => setShowImageSourceModal(true)}
        >
          <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
          <Text className="text-[9px] text-gray-400 mt-1">Add Photo</Text>
        </TouchableOpacity>
      </View>

      <InputField label="Shop Name" value={shopName} onChangeText={setShopName} placeholder="Enter shop name" required />
      <InputField label="Owner Name" value={ownerName} onChangeText={setOwnerName} placeholder="Enter owner name" required />
      <InputField
        label="Contact Number" value={contact} onChangeText={(t: string) => setContact(t.replace(/[^0-9]/g, ''))}
        placeholder="XXXXX XXXXX" required keyboardType="phone-pad" maxLength={10} prefix="+91"
      />
      <InputField label="Email" value={email} onChangeText={setEmail} placeholder="store@example.com" keyboardType="email-address" />
      <DropdownField label="Shop Type" value={shopType} onPress={() => setShowShopTypePicker(true)} placeholder="Select shop type" required />
    </>
  );

  const renderStep2 = () => (
    <>
      <InputField
        label="PIN Code" value={pin} onChangeText={handlePinChange}
        placeholder="6-digit PIN" required keyboardType="number-pad" maxLength={6}
        loading={loadingPin}
      />
      <InputField label="Address Line 1" value={address1} onChangeText={setAddress1} placeholder="Street / Building / Area" required />
      <InputField label="Address Line 2" value={address2} onChangeText={setAddress2} placeholder="Landmark (Optional)" />
      <InputField label="City" value={city} onChangeText={setCity} placeholder="Enter city" required />
      <InputField label="District" value={district} onChangeText={setDistrict} placeholder="Enter district" required editable={pin.length !== 6} />
      <DropdownField label="State" value={state} onPress={() => setShowStatePicker(true)} placeholder="Select state" required disabled={pin.length === 6} />
    </>
  );

  const renderStep3 = () => (
    <>
      <InputField label="License No" value={licenseNo} onChangeText={setLicenseNo} placeholder="Enter license number" />
      <InputField label="FSSAI License" value={fssaiLicense} onChangeText={setFssaiLicense} placeholder="Enter FSSAI license" />
      <InputField label="GST Number" value={gstNumber} onChangeText={(t: string) => setGstNumber(t.toUpperCase())} placeholder="Enter GST number" maxLength={15} />
      <InputField label="PAN Number" value={panNumber} onChangeText={(t: string) => setPanNumber(t.toUpperCase())} placeholder="Enter PAN number" maxLength={10} />
    </>
  );

  const renderStep4 = () => (
    <>
      {/* Images preview */}
      {storeImages.length > 0 && (
        <View className="mb-4">
          <Text className="text-xs font-bold text-gray-400 uppercase mb-2">Store Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {storeImages.map((uri, i) => (
              <Image key={i} source={{ uri }} className="w-16 h-16 rounded-lg mr-2 bg-gray-200" resizeMode="cover" />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Personal Section */}
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-bold text-gray-800">Personal Details</Text>
          <TouchableOpacity onPress={() => setCurrentStep(0)} className="p-1">
            <Feather name="edit-2" size={16} color="#1A3F75" />
          </TouchableOpacity>
        </View>
        <ReviewItem label="Shop Name" value={shopName} />
        <ReviewItem label="Owner Name" value={ownerName} />
        <ReviewItem label="Contact" value={contact ? `+91 ${contact}` : ''} />
        <ReviewItem label="Email" value={email} />
        <ReviewItem label="Shop Type" value={shopType} />
      </View>

      {/* Address Section */}
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-bold text-gray-800">Address</Text>
          <TouchableOpacity onPress={() => setCurrentStep(1)} className="p-1">
            <Feather name="edit-2" size={16} color="#1A3F75" />
          </TouchableOpacity>
        </View>
        <ReviewItem label="Address 1" value={address1} />
        <ReviewItem label="Address 2" value={address2} />
        <ReviewItem label="City" value={city} />
        <ReviewItem label="District" value={district} />
        <ReviewItem label="PIN Code" value={pin} />
        <ReviewItem label="State" value={state} />
      </View>

      {/* Legal Section */}
      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-bold text-gray-800">Legal Details</Text>
          <TouchableOpacity onPress={() => setCurrentStep(2)} className="p-1">
            <Feather name="edit-2" size={16} color="#1A3F75" />
          </TouchableOpacity>
        </View>
        <ReviewItem label="License No" value={licenseNo} />
        <ReviewItem label="FSSAI License" value={fssaiLicense} />
        <ReviewItem label="GST Number" value={gstNumber} />
        <ReviewItem label="PAN Number" value={panNumber} />
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-[#F3F6F8]">
      {/* ─── Header ─────────────────────────────────────── */}
      <LinearGradient
        colors={['#1A3F75', '#2D5A9E']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View className="flex-row items-center mb-5">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold flex-1">Create New Store</Text>
          <Text className="text-white/60 text-xs font-medium">
            Step {currentStep + 1} of {STEPS.length}
          </Text>
        </View>

        {/* ─── Step Progress ─────────────────────────────── */}
        <View className="mt-2 mb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <React.Fragment key={step}>
                  {/* Step Item */}
                  <TouchableOpacity
                    className="flex-row items-center mr-2"
                    onPress={() => {
                      if (index <= currentStep) setCurrentStep(index);
                    }}
                  >
                    <View className={`w-6 h-6 rounded-full items-center justify-center ${
                      isCompleted ? 'bg-[#059669]' : isActive ? 'bg-white' : 'bg-white/20'
                    }`}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={14} color="white" />
                      ) : (
                        <Text className={`text-[11px] font-bold ${isActive ? 'text-[#1A3F75]' : 'text-white/60'}`}>
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    <Text className={`text-[12px] font-bold ml-2 ${isCompleted ? 'text-white' : isActive ? 'text-white' : 'text-white/60'}`}>
                      {step}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <View className="justify-center mr-2">
                       <View className="w-8 h-[2px] bg-white/40" />
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* ─── Form Body ───────────────────────────────────── */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-5 pt-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 0 && renderStep1()}
          {currentStep === 1 && renderStep2()}
          {currentStep === 2 && renderStep3()}
          {currentStep === 3 && renderStep4()}
        </ScrollView>

        {/* ─── Bottom Action Bar ────────────────────────────── */}
        <View
          className="bg-white border-t border-gray-100 px-5 flex-row gap-3"
          style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : Math.max(insets.bottom + 8, 16), paddingTop: 12 }}
        >
          {currentStep > 0 && (
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 items-center"
              onPress={handlePrevious}
            >
              <Text className="text-gray-600 font-bold text-[14px]">Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 py-3.5 rounded-2xl bg-[#1A3F75] items-center"
            onPress={currentStep === 3 ? handleSubmit : handleNext}
          >
            <Text className="text-white font-bold text-[14px]">
              {currentStep === 3 ? 'Submit' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ─── Shop Type Picker ─────────────────────────────── */}
      <Modal visible={showShopTypePicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 30 }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Select Shop Type</Text>
              <TouchableOpacity onPress={() => setShowShopTypePicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {SHOP_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                className={`flex-row justify-between items-center p-4 rounded-xl mb-3 ${shopType === type ? 'bg-[#EFF6FF]' : 'bg-gray-50'}`}
                onPress={() => { setShopType(type); setShowShopTypePicker(false); }}
              >
                <Text className={`font-bold ${shopType === type ? 'text-[#1A3F75]' : 'text-gray-600'}`}>{type}</Text>
                {shopType === type && <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ─── State Picker ─────────────────────────────────── */}
      <Modal visible={showStatePicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 30, maxHeight: '70%' }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Select State</Text>
              <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {INDIAN_STATES.map((s) => (
                <TouchableOpacity
                  key={s}
                  className={`flex-row justify-between items-center p-3.5 rounded-xl mb-2 ${state === s ? 'bg-[#EFF6FF]' : 'bg-gray-50'}`}
                  onPress={() => { setState(s); setShowStatePicker(false); }}
                >
                  <Text className={`font-medium text-sm ${state === s ? 'text-[#1A3F75] font-bold' : 'text-gray-600'}`}>{s}</Text>
                  {state === s && <Ionicons name="checkmark-circle" size={22} color="#1A3F75" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── Image Source Modal ────────────────────────────── */}
      <Modal visible={showImageSourceModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-5 pt-5" style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 30 }}>
            <Text className="text-lg font-bold text-gray-800 mb-4">Add Store Photo</Text>
            <TouchableOpacity className="flex-row items-center bg-[#EFF6FF] rounded-2xl p-4 mb-3" onPress={takePhoto}>
              <View className="w-10 h-10 rounded-full bg-[#1A3F75] items-center justify-center mr-4">
                <Ionicons name="camera" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-gray-800">Take a Photo</Text>
                <Text className="text-[12px] text-gray-400">Use camera to capture</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-[#F0FDF4] rounded-2xl p-4 mb-4" onPress={pickFromGallery}>
              <View className="w-10 h-10 rounded-full bg-[#059669] items-center justify-center mr-4">
                <Ionicons name="images" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-gray-800">Choose from Gallery</Text>
                <Text className="text-[12px] text-gray-400">Select from your photos</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity className="py-3.5 rounded-2xl bg-gray-100 items-center" onPress={() => setShowImageSourceModal(false)}>
              <Text className="text-gray-600 font-bold text-[14px]">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Popup Modal ──────────────────────────────────── */}
      <Modal visible={popupVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-8">
          <View className="bg-white rounded-3xl w-full p-6 items-center shadow-xl">
            <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${popupTitle === 'Success' ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'}`}>
              <Ionicons name={popupTitle === 'Success' ? 'checkmark-circle' : 'alert-circle'} size={32} color={popupTitle === 'Success' ? '#059669' : '#DC2626'} />
            </View>
            <Text className="text-[18px] font-bold text-gray-800 mb-2 text-center">{popupTitle}</Text>
            <Text className="text-[14px] text-gray-500 text-center mb-6 leading-5">{popupMessage}</Text>
            <TouchableOpacity
              className="w-full py-3.5 rounded-2xl bg-[#1A3F75] items-center"
              onPress={() => {
                setPopupVisible(false);
                if (popupTitle === 'Success') router.back();
              }}
            >
              <Text className="text-white font-bold text-[14px]">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
