import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Platform,
  Image, TextInput, Modal, KeyboardAvoidingView, ActivityIndicator, Keyboard,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import { useShopStore, useRouteStore } from '../../store/store';
import { compressToWebP } from '../../utils/imageCompress';
import { scale, moderateScale, verticalScale } from '../../utils/scale';
import pincodeData from '../../india_pincode_data.json';
const STEPS = ['Personal', 'Address', 'Legal', 'Review'];
const SHOP_TYPES = ['Retail', 'Wholesaler'];

// ─── Input Component ──────────────────────────────────────────────────────────
const InputField = ({
  label, value, onChangeText, placeholder, required = false,
  keyboardType = 'default' as any, multiline = false, maxLength, prefix,
  editable = true, loading = false, rightElement, autoCapitalize = 'none',
}: any) => (
  <View style={{ marginBottom: scale(16) }}>
    <Text style={{ fontSize: moderateScale(11), fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: scale(6) }}>
      {label}{required ? ' *' : ''}
    </Text>
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      borderRadius: scale(12), borderWidth: 1, borderColor: '#F3F4F6',
      backgroundColor: editable ? '#F9FAFB' : '#F3F4F6',
    }}>
      {prefix && (
        <Text style={{ paddingLeft: 14, fontSize: 14, fontWeight: '600', color: '#4B5563' }}>{prefix}</Text>
      )}
      <TextInput
        style={{
          flex: 1, padding: scale(14), fontSize: moderateScale(14),
          color: editable ? '#1F2937' : '#6B7280',
          ...(multiline ? { minHeight: scale(60), textAlignVertical: 'top' } : {}),
        }}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={autoCapitalize}
      />
      {loading && (
        <View style={{ paddingRight: 14 }}>
          <ActivityIndicator size="small" color="#1A3F75" />
        </View>
      )}
      {rightElement && (
        <View style={{ paddingRight: 8 }}>{rightElement}</View>
      )}
    </View>
  </View>
);

// ─── Dropdown Component ───────────────────────────────────────────────────────
const DropdownField = ({ label, value, onPress, placeholder, required = false, disabled = false }: any) => (
  <View style={{ marginBottom: scale(16) }}>
    <Text style={{ fontSize: moderateScale(11), fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: scale(6) }}>
      {label}{required ? ' *' : ''}
    </Text>
    <TouchableOpacity
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: scale(12), borderWidth: 1, borderColor: '#F3F4F6',
        padding: scale(14), backgroundColor: disabled ? '#F3F4F6' : '#F9FAFB',
      }}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Text style={{
        fontSize: moderateScale(14), fontWeight: value ? '500' : '400',
        color: value ? (disabled ? '#6B7280' : '#1F2937') : '#9CA3AF',
      }}>
        {value || placeholder}
      </Text>
      {!disabled && <Ionicons name="chevron-down" size={18} color="#9CA3AF" />}
    </TouchableOpacity>
  </View>
);



// ─── Review Item ──────────────────────────────────────────────────────────────
const ReviewItem = ({ label, value }: { label: string; value: string }) => (
  <View style={{ paddingVertical: scale(10), borderBottomWidth: 1, borderBottomColor: '#F9FAFB' }}>
    <Text style={{ fontSize: moderateScale(11), color: '#6B7280', marginBottom: scale(2) }}>{label}</Text>
    <Text style={{ fontSize: moderateScale(13), fontWeight: '700', color: '#1F2937' }} numberOfLines={2}>
      {value || '—'}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CreateStoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createShop } = useShopStore();
  const { routes } = useRouteStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingGST, setIsValidatingGST] = useState(false);
  const [gstStatus, setGstStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // ── Location ────────────────────────────────────────────────────────────────
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  React.useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;

        // Try balanced accuracy first; fall back to last known if GPS unavailable
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).catch(async () => Location.getLastKnownPositionAsync());

        if (!cancelled && loc) {
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (err) {
        // Non-fatal — form works fine without location
        console.warn('Location unavailable (non-fatal):', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Step 1 — Personal ───────────────────────────────────────────────────────
  const [storeImages, setStoreImages] = useState<string[]>([]);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [shopType, setShopType] = useState('');
  const [showShopTypePicker, setShowShopTypePicker] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  // ── Step 2 — Address ────────────────────────────────────────────────────────
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [pin, setPin] = useState('');
  const [state, setState] = useState('');
  const [loadingPin, setLoadingPin] = useState(false);
  const [pinNotFound, setPinNotFound] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [isManualArea, setIsManualArea] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [showRoutePicker, setShowRoutePicker] = useState(false);
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  // ── Step 3 — Legal ──────────────────────────────────────────────────────────
  const [licenseNo, setLicenseNo] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [category] = useState('medicine');

  // ── Popup ───────────────────────────────────────────────────────────────────
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupIsSuccess, setPopupIsSuccess] = useState(false);
  const [shouldRedirectOnClose, setShouldRedirectOnClose] = useState(false);

  const showPopup = (title: string, message: string, isSuccess?: boolean, shouldRedirect?: boolean) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupIsSuccess(isSuccess ?? title === 'Success');
    setShouldRedirectOnClose(shouldRedirect ?? title === 'Success');
    setPopupVisible(true);
  };

  // ── Auto-set first route ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (routes.length > 0 && !routeId) {
      setRouteId(routes[0].id.toString());
    }
  }, [routes]);

  const selectedRouteObj = routes.find(r => r.id.toString() === routeId);

  const fetchPinDetails = async (pinCode: string) => {
    try {
      const allStates = (pincodeData as any).data;
      for (const stateName in allStates) {
        const districts = allStates[stateName].districts;
        for (const districtName in districts) {
          const pincodes = districts[districtName].pincodes;
          const found = pincodes.find((p: any) => p.pincode === pinCode);
          if (found) {
            return {
              state: stateName,
              district: districtName,
              city: found.block || districtName,
            };
          }
        }
      }
    } catch (error) {
      console.error("Local PIN lookup failed:", error);
    }
    return null;
  };

  // ── PIN lookup ───────────────────────────────────────────────────────────────
  const handlePinChange = async (text: string) => {
    const pinCode = text.replace(/[^0-9]/g, '');
    setPin(pinCode);
    if (pinCode.length === 6) {
      setLoadingPin(true);
      try {
        const details = await fetchPinDetails(pinCode);
        if (details) {
          setState(details.state);
          setDistrict(details.district);
          setCity(details.city);
          setPinNotFound(false);
        } else {
          setPinNotFound(true);
          setState('');
          setDistrict('');
          setCity('');
        }
      } catch (err) {
        console.warn('PIN Lookup Error:', err);
      } finally {
        setLoadingPin(false);
      }
    } else {
      setPinNotFound(false);
    }
  };

  // ── Image handling ──────────────────────────────────────────────────────────
  // Compress image to WebP and return the new stable URI.
  // manipulateAsync saves the output to a new file in the cache,
  // which also solves the volatile ImagePicker cache issue.
  const processImage = async (sourceUri: string): Promise<string> => {
    try {
      // compressToWebP returns a new URI in a stable location
      const compressedUri = await compressToWebP(sourceUri, 0.7);
      console.log('Image compressed to WebP:', compressedUri);
      return compressedUri;
    } catch (err) {
      console.warn('Compression failed, using original:', err);
      // Fallback: ensure valid file:// scheme
      if (!sourceUri.startsWith('file://') && !sourceUri.startsWith('content://') && !sourceUri.startsWith('http')) {
        return `file://${sourceUri}`;
      }
      return sourceUri;
    }
  };

  const pickFromGallery = async () => {
    setShowImageSourceModal(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });
      if (!result.canceled) {
        // MUST process sequentially on Android to prevent expo-image-manipulator
        // native module from crashing or returning corrupted URIs during concurrent execution
        const processedUris: string[] = [];
        for (const asset of result.assets) {
          const processedUri = await processImage(asset.uri);
          processedUris.push(processedUri);
        }
        setStoreImages(prev => [...prev, ...processedUris]);
      }
    } catch (err) {
      console.warn('Gallery error:', err);
      showPopup('Error', 'Could not open gallery. Please try again.');
    }
  };

  const takePhoto = async () => {
    setShowImageSourceModal(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showPopup('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const processedUri = await processImage(result.assets[0].uri);
        setStoreImages(prev => [...prev, processedUri]);
      }
    } catch (err) {
      console.warn('Camera error:', err);
      showPopup('Error', 'Could not open camera. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setStoreImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!shopName.trim()) { showPopup('Required', 'Please enter the shop name.'); return false; }
        if (!ownerName.trim()) { showPopup('Required', 'Please enter the owner name.'); return false; }
        if (!contact.trim() || contact.length < 10) { showPopup('Required', 'Please enter a valid 10-digit contact number.'); return false; }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showPopup('Invalid Email', 'Please enter a valid email address.'); return false; }
        if (!shopType) { showPopup('Required', 'Please select a shop type.'); return false; }
        return true;
      case 1:
        if (!address1.trim()) { showPopup('Required', 'Please enter Address Line 1.'); return false; }
        if (!city.trim()) { showPopup('Required', 'Please enter the city.'); return false; }
        if (!district.trim()) { showPopup('Required', 'Please enter the district.'); return false; }
        if (!pin.trim() || pin.length !== 6) { showPopup('Required', 'Please enter a valid 6-digit PIN code.'); return false; }
        if (!state) { showPopup('Required', 'Please select the state.'); return false; }
        if (routes.length > 1 && !routeId) { showPopup('Required', 'Please select a route.'); return false; }
        if (isManualArea) {
          if (!areaName.trim()) { showPopup('Required', 'Please enter the area name.'); return false; }
        } else {
          if (!areaId) { showPopup('Required', 'Please select an area.'); return false; }
        }
        return true;
      case 2: {
        if (!licenseNo.trim()) { showPopup('Required', 'Please enter the license number.'); return false; }
        if (!fssaiLicense.trim() || fssaiLicense.length !== 14) { showPopup('Required', 'Please enter a valid 14-digit FSSAI license.'); return false; }
        if (!gstNumber.trim() || gstNumber.length !== 15) { showPopup('Required', 'Please enter a valid 15-digit GST number.'); return false; }
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(gstNumber)) { showPopup('Invalid GST', 'Please enter a valid GST number format.'); return false; }
        if (!panNumber.trim() || panNumber.length !== 10) { showPopup('Required', 'Please enter a valid 10-digit PAN number.'); return false; }
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(panNumber)) { showPopup('Invalid PAN', 'Please enter a valid PAN number format.'); return false; }
        return true;
      }
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleValidateGST = async () => {
    if (!gstNumber || gstNumber.length !== 15) {
      showPopup('Invalid GST', 'Please enter a valid 15-digit GST number.');
      setGstStatus('error');
      return;
    }
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      showPopup('Invalid GST', 'The GST number format is incorrect.');
      setGstStatus('error');
      return;
    }
    setIsValidatingGST(true);
    setGstStatus('idle');

    try {
      const apiKey = process.env.EXPO_PUBLIC_GST_API_KEY || 'e0f96d43aa26b0dd45a97409ace7a7a4';
      const url = `https://sheet.gstincheck.co.in/check/${apiKey}/${gstNumber}`;
      console.log('Validating GSTIN via URL:', url);

      const response = await fetch(url);
      const resData = await response.json();
      console.log('GST API Response:', resData);

      if (resData && resData.flag === true) {
        setGstStatus('success');
        const legalName = resData.data?.lgnm || resData.data?.tradeNam || '';
        const status = resData.data?.sts || 'Active';

        let message = `GSTIN is valid and active.\n`;
        if (legalName) {
          message += `\nLegal Name: ${legalName}`;
        }
        if (status) {
          message += `\nStatus: ${status}`;
        }

        // Auto-fill some fields if they are empty
        if (legalName && !shopName) {
          setShopName(legalName);
        }
        if (legalName && !ownerName) {
          setOwnerName(legalName);
        }

        showPopup('GST Verified', message, true);
      } else {
        setGstStatus('error');
        const errMsg = resData?.message || 'The GST number could not be validated or is invalid.';
        showPopup('GST Validation Failed', errMsg);
      }
    } catch (err: any) {
      console.error('GST Validation Error:', err);
      setGstStatus('error');
      showPopup('Verification Error', 'Unable to connect to the GST verification service. Please try again.');
    } finally {
      setIsValidatingGST(false);
    }
  };


  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitting) return; // guard against double-tap
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Attach compressed WebP images to FormData
      let imageCount = 0;
      for (let i = 0; i < storeImages.length; i++) {
        let uri = storeImages[i];
        if (!uri) continue;

        // React Native fetch requires the URI to have a scheme (file:// or content://)
        if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://') && !uri.startsWith('http')) {
          uri = `file://${uri}`;
        }

        // On Android, decode percent-encoded characters (like %2540 -> %40 -> @)
        // to prevent React Native XHR from failing to find the file on Android disk
        if (Platform.OS === 'android' && uri.startsWith('file://')) {
          try {
            let decoded = uri;
            while (decoded.includes('%')) {
              const next = decodeURIComponent(decoded);
              if (next === decoded) break;
              decoded = next;
            }
            uri = decoded;
          } catch (e) {
            console.warn('URI decode failed:', e);
          }
        }

        try {
          const name = `shop_image_${i}.webp`;
          const fileObj = {
            uri: String(uri),
            name: String(name),
            type: 'image/webp',
          };
          formData.append(`images[${imageCount}]`, fileObj as any);
          console.log(`Attached image[${imageCount}]: uri=${uri}, name=${name}`);
          imageCount++;
        } catch (e) {
          console.warn(`Error appending image ${i}:`, e);
        }
      }
      console.log(`Total images attached: ${imageCount}`);

      // Sanitize all strings to prevent native TypeErrors
      formData.append('shop_name', String(shopName || '').trim());
      formData.append('owner_name', String(ownerName || '').trim());
      formData.append('contact', String(contact || '').trim());
      formData.append('email', String(email || '').trim());
      formData.append('shop_type', String(shopType || '').trim());
      formData.append('category', String(category || '').trim());

      const fullAddress = [address1, address2, city, district, `${state} - ${pin}`]
        .filter(Boolean).join(', ');
      formData.append('address', String(fullAddress || '').trim());

      // Safe 0,0 fallback if GPS was never captured — never block submission
      formData.append('latitude', String(location?.latitude ?? 0));
      formData.append('longitude', String(location?.longitude ?? 0));

      formData.append('license_no', String(licenseNo || '').trim());
      formData.append('fssai_license', String(fssaiLicense || '').trim());
      formData.append('gst_number', String(gstNumber || '').trim());
      formData.append('pan_number', String(panNumber || '').trim());
      formData.append('route_id', String(routeId || '').trim());

      if (isManualArea) {
        formData.append('area_name', String(areaName || '').trim());
      } else {
        formData.append('area_id', String(areaId || '').trim());
      }

      await createShop(formData);
      showPopup('Success', 'Store created successfully!');
    } catch (error: any) {
      console.error('Full Submission Error:', error);
      let msg = 'Failed to create store. Please try again.';

      if (error?.response?.data) {
        const data = error.response.data;
        // Handle Laravel validation errors
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          msg = Array.isArray(firstError) ? firstError[0] : String(firstError);
        } else {
          msg = data.message || data.error || msg;
        }
      } else if (error?.message) {
        msg = error.message;
      }

      showPopup('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step Renderers ────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <>
      <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>
        Store Images
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
        {storeImages.map((uri, index) => (
          <View key={`s1img-${index}`} style={{ marginRight: 8, marginBottom: 8, position: 'relative' }}>
            <Image
              source={{ uri }}
              style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: '#E5E7EB' }}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={{
                position: 'absolute', top: -4, right: -4, width: 20, height: 20,
                borderRadius: 10, backgroundColor: '#EF4444',
                alignItems: 'center', justifyContent: 'center',
              }}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={12} color="white" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={{
            width: 80, height: 80, borderRadius: 12, backgroundColor: '#F3F4F6',
            borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D5DB',
            alignItems: 'center', justifyContent: 'center',
          }}
          onPress={() => setShowImageSourceModal(true)}
        >
          <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
          <Text style={{ fontSize: 9, color: '#9CA3AF', marginTop: 4 }}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      <InputField label="Shop Name" value={shopName} onChangeText={setShopName} placeholder="Enter shop name" required maxLength={100} />
      <InputField label="Owner Name" value={ownerName} onChangeText={setOwnerName} placeholder="Enter owner name" required maxLength={50} />
      <InputField
        label="Contact Number" value={contact}
        onChangeText={(t: string) => setContact(t.replace(/[^0-9]/g, ''))}
        placeholder="XXXXX XXXXX" required keyboardType="phone-pad" maxLength={10} prefix="+91"
      />
      <InputField label="Email" value={email} onChangeText={setEmail} placeholder="store@example.com" keyboardType="email-address" maxLength={100} />
      <DropdownField label="Shop Type" value={shopType} onPress={() => setShowShopTypePicker(true)} placeholder="Select shop type" required />
    </>
  );

  const renderStep2 = () => {
    return (
      <>
        <InputField
          label="PIN Code" value={pin} onChangeText={handlePinChange}
          placeholder="6-digit PIN" required keyboardType="number-pad" maxLength={6} loading={loadingPin}
        />
        <InputField label="Address Line 1" value={address1} onChangeText={setAddress1} placeholder="Street / Building / Area" required maxLength={200} />
        <InputField label="Address Line 2" value={address2} onChangeText={setAddress2} placeholder="Landmark (Optional)" maxLength={200} />

        <InputField
          label="State" value={state} onChangeText={setState} editable={pinNotFound} placeholder={pinNotFound ? "Enter State" : "Auto-populated from PIN"} required
        />

        <InputField
          label="District" value={district} onChangeText={setDistrict} editable={pinNotFound} placeholder={pinNotFound ? "Enter District" : "Auto-populated from PIN"} required
        />

        <InputField
          label="City" value={city} onChangeText={setCity} placeholder="Enter City" required maxLength={50}
        />

        {routes.length > 1 && (
          <DropdownField
            label="Route"
            value={selectedRouteObj?.name || ''}
            onPress={() => setShowRoutePicker(true)}
            placeholder="Select route"
            required
          />
        )}
        {isManualArea ? (
          <InputField
            label="Area" value={areaName} onChangeText={setAreaName} placeholder="Enter area name" required
            rightElement={
              <TouchableOpacity onPress={() => { setIsManualArea(false); setAreaName(''); }}>
                <Text style={{ color: '#1A3F75', fontSize: 10, fontWeight: '700', marginRight: 8 }}>SELECT LIST</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <DropdownField
            label="Area"
            value={selectedRouteObj?.areas?.find((a: any) => a.id.toString() === areaId)?.name || ''}
            onPress={() => setShowAreaPicker(true)} placeholder="Select area" required disabled={!routeId}
          />
        )}
      </>
    );
  };

  const renderStep3 = () => (
    <>
      <InputField label="License No" value={licenseNo} onChangeText={setLicenseNo} placeholder="Enter license number" maxLength={20} required autoCapitalize="characters" />
      <InputField
        label="FSSAI License" value={fssaiLicense}
        onChangeText={(t: string) => setFssaiLicense(t.replace(/[^0-9]/g, ''))}
        placeholder="Enter 14-digit FSSAI" maxLength={14} keyboardType="number-pad" required
      />
      <InputField
        label="GST Number" value={gstNumber}
        onChangeText={(t: string) => {
          setGstNumber(t.toUpperCase());
          setGstStatus('idle');
        }}
        placeholder="Enter 15-digit GST number" maxLength={15} required autoCapitalize="characters"
        loading={isValidatingGST}
        rightElement={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {gstStatus === 'success' && (
              <Ionicons name="checkmark-circle" size={22} color="#10B981" style={{ marginRight: 8 }} />
            )}
            {gstStatus === 'error' && (
              <Ionicons name="alert-circle" size={22} color="#EF4444" style={{ marginRight: 8 }} />
            )}
            {gstStatus !== 'success' && (
              <TouchableOpacity
                style={{ backgroundColor: '#1A3F75', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6 }}
                onPress={handleValidateGST}
                disabled={isValidatingGST}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>VALIDATE</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <InputField
        label="PAN Number" value={panNumber}
        onChangeText={(t: string) => setPanNumber(t.toUpperCase())}
        placeholder="Enter 10-digit PAN number" maxLength={10} required autoCapitalize="characters"
      />
    </>
  );

  // KEY FIX for review images:
  // - Removed nested ScrollView (was causing images to not render)
  // - Images wrapped in a View with overflow:'hidden' + explicit width/height
  // - All styles are inline (no className) so NativeWind can't interfere
  // - Unique keys use prefix to avoid React key collisions across re-renders
  const renderStep4 = () => (
    <>
      {storeImages.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>
            Store Images ({storeImages.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {storeImages.map((uri, i) => (
              <View
                key={`review-img-${i}`}
                style={{
                  width: 72, height: 72, borderRadius: 12,
                  marginRight: 10, marginBottom: 10,
                  backgroundColor: '#E5E7EB', overflow: 'hidden',
                  borderWidth: 1, borderColor: '#E5E7EB'
                }}
              >
                <Image
                  key={`img-comp-${uri}`}
                  source={{ uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={(e) => console.warn(`Review image ${i} failed to load:`, e.nativeEvent.error)}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Personal Section */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>Personal Details</Text>
          <TouchableOpacity onPress={() => setCurrentStep(0)} style={{ padding: 4 }}>
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
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>Address</Text>
          <TouchableOpacity onPress={() => setCurrentStep(1)} style={{ padding: 4 }}>
            <Feather name="edit-2" size={16} color="#1A3F75" />
          </TouchableOpacity>
        </View>
        <ReviewItem label="Address 1" value={address1} />
        <ReviewItem label="Address 2" value={address2} />
        <ReviewItem label="City" value={city} />
        <ReviewItem label="District" value={district} />
        <ReviewItem label="PIN Code" value={pin} />
        <ReviewItem label="State" value={state} />
        <ReviewItem
          label="Area"
          value={isManualArea ? areaName : (selectedRouteObj?.areas?.find((a: any) => a.id.toString() === areaId)?.name || '')}
        />
      </View>

      {/* Legal Section */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>Legal Details</Text>
          <TouchableOpacity onPress={() => setCurrentStep(2)} style={{ padding: 4 }}>
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#F3F6F8' }}>

      {/* Header */}
      <LinearGradient
        colors={['#1A3F75', '#2D5A9E']}
        style={{
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>Create New Store</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' }}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
        </View>

        {/* Step Progress */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            return (
              <React.Fragment key={step}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}
                  onPress={() => { if (index <= currentStep) setCurrentStep(index); }}
                >
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isCompleted ? '#059669' : isActive ? 'white' : 'rgba(255,255,255,0.2)',
                  }}>
                    {isCompleted
                      ? <Ionicons name="checkmark" size={14} color="white" />
                      : <Text style={{ fontSize: 11, fontWeight: '700', color: isActive ? '#1A3F75' : 'rgba(255,255,255,0.6)' }}>{index + 1}</Text>
                    }
                  </View>
                  <Text style={{
                    fontSize: 12, fontWeight: '700', marginLeft: 8,
                    color: isActive || isCompleted ? 'white' : 'rgba(255,255,255,0.6)',
                  }}>{step}</Text>
                </TouchableOpacity>
                {index < STEPS.length - 1 && (
                  <View style={{ justifyContent: 'center', marginRight: 8 }}>
                    <View style={{ width: 32, height: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* Form Body */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {currentStep === 0 && renderStep1()}
          {currentStep === 1 && renderStep2()}
          {currentStep === 2 && renderStep3()}
          {currentStep === 3 && renderStep4()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Bar */}
      {!isKeyboardVisible && (
        <View style={{
          backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F3F4F6',
          paddingHorizontal: scale(20), paddingTop: scale(12),
          paddingBottom: insets.bottom + scale(16),
          flexDirection: 'row', gap: scale(12),
        }}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: scale(14), borderRadius: scale(16), backgroundColor: '#F3F4F6', alignItems: 'center' }}
              onPress={handlePrevious}
              disabled={isSubmitting}
            >
              <Text style={{ color: '#4B5563', fontWeight: '700', fontSize: moderateScale(14) }}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{
              flex: 1, paddingVertical: scale(14), borderRadius: scale(16), alignItems: 'center',
              backgroundColor: isSubmitting ? 'rgba(26,63,117,0.6)' : '#1A3F75',
            }}
            onPress={currentStep === 3 ? handleSubmit : handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={{ color: 'white', fontWeight: '700', fontSize: moderateScale(14) }}>{currentStep === 3 ? 'Submit' : 'Next'}</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* ── Shop Type Picker ── */}
      <Modal visible={showShopTypePicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), padding: scale(24), paddingBottom: Math.max(insets.bottom, scale(20)) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>Select Shop Type</Text>
              <TouchableOpacity onPress={() => setShowShopTypePicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {SHOP_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  padding: 16, borderRadius: 12, marginBottom: 20,
                  backgroundColor: shopType === type ? '#EFF6FF' : '#F9FAFB',
                }}
                onPress={() => { setShopType(type); setShowShopTypePicker(false); }}
              >
                <Text style={{ fontWeight: '700', color: shopType === type ? '#1A3F75' : '#4B5563' }}>{type}</Text>
                {shopType === type && <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>


      {/* ── Route Picker ── */}
      <Modal visible={showRoutePicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), padding: scale(24), paddingBottom: Math.max(insets.bottom, scale(20)), maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>Select Route</Text>
              <TouchableOpacity onPress={() => setShowRoutePicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {routes.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    padding: 14, borderRadius: 12, marginBottom: 8,
                    backgroundColor: routeId === r.id.toString() ? '#EFF6FF' : '#F9FAFB',
                  }}
                  onPress={() => {
                    setRouteId(r.id.toString());
                    setAreaId('');
                    setIsManualArea(false);
                    setShowRoutePicker(false);
                  }}
                >
                  <Text style={{ fontWeight: routeId === r.id.toString() ? '700' : '500', fontSize: 14, color: routeId === r.id.toString() ? '#1A3F75' : '#4B5563' }}>{r.name}</Text>
                  {routeId === r.id.toString() && <Ionicons name="checkmark-circle" size={22} color="#1A3F75" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Area Picker ── */}
      <Modal visible={showAreaPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), padding: scale(24), paddingBottom: Math.max(insets.bottom, scale(20)), maxHeight: '95%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>Select Area</Text>
              <TouchableOpacity onPress={() => setShowAreaPicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRouteObj?.areas?.map((a: any) => (
                <TouchableOpacity
                  key={a.id}
                  style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    padding: 14, borderRadius: 12, marginBottom: 8,
                    backgroundColor: areaId === a.id.toString() ? '#EFF6FF' : '#F9FAFB',
                  }}
                  onPress={() => { setAreaId(a.id.toString()); setIsManualArea(false); setShowAreaPicker(false); }}
                >
                  <Text style={{ fontWeight: areaId === a.id.toString() ? '700' : '500', fontSize: 14, color: areaId === a.id.toString() ? '#1A3F75' : '#4B5563' }}>{a.name}</Text>
                  {areaId === a.id.toString() && <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  padding: 16, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed',
                  borderColor: '#1A3F75', marginTop: 8, backgroundColor: '#F0F7FF',
                  marginBottom: insets.bottom + scale(5),
                }}
                onPress={() => { setIsManualArea(true); setAreaId(''); setShowAreaPicker(false); }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#1A3F75" />
                <Text style={{ marginLeft: 8, fontWeight: '700', color: '#1A3F75' }}>Can't find your area? Add New</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Image Source Modal ── */}
      <Modal visible={showImageSourceModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: scale(24), borderTopRightRadius: scale(24), paddingHorizontal: scale(20), paddingTop: scale(20), paddingBottom: Math.max(insets.bottom, scale(20)) }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 }}>Add Store Photo</Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, marginBottom: 12 }}
              onPress={takePhoto}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A3F75', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>Take a Photo</Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Use camera to capture</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 16 }}
              onPress={pickFromGallery}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Ionicons name="images" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>Choose from Gallery</Text>
                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Select from your photos</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingVertical: 14, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center' }}
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={{ color: '#4B5563', fontWeight: '700', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Popup Modal ── */}
      <Modal visible={popupVisible} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 24, width: '100%', padding: 24, alignItems: 'center' }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              backgroundColor: popupIsSuccess ? '#ECFDF5' : '#FEF2F2',
            }}>
              <Ionicons
                name={popupIsSuccess ? 'checkmark-circle' : 'alert-circle'}
                size={32}
                color={popupIsSuccess ? '#059669' : '#DC2626'}
              />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8, textAlign: 'center' }}>{popupTitle}</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>{popupMessage}</Text>
            <TouchableOpacity
              style={{ width: '100%', paddingVertical: 14, borderRadius: 16, backgroundColor: '#1A3F75', alignItems: 'center' }}
              onPress={() => {
                setPopupVisible(false);
                if (shouldRedirectOnClose) {
                  setTimeout(() => router.back(), 150);
                }
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Standard Loading Overlay */}
      <Modal visible={isSubmitting} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 32, borderRadius: 24, alignItems: 'center', width: '80%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}>
            <ActivityIndicator size="large" color="#1A3F75" />
            <Text style={{ marginTop: 20, fontSize: 16, fontWeight: '700', color: '#1A3F75' }}>Creating Store...</Text>
            <Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280', textAlign: 'center' }}>Please wait while we process your request.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
