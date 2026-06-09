import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusModal } from "../../components/ui/status-modal";
import {
  IMAGE_BASE_URL,
  useOrderStore,
  useProductStore,
  useShopStore,
  useDashboardStore,
} from "../../store/store";
import { moderateScale, scale } from "../../utils/scale";

const STEPS = ["Store", "Products", "Review"];

interface CartItem {
  id: number;
  name: string;
  brand: string;
  qty: number;
}

export default function OrderCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const fromStore = params.fromStore === "true";
  const storeIdParam = params.storeId as string;
  const preSelectedStore = fromStore ? (params.storeName as string) : "";
  const storeCategory = (params.storeCategory as string) || "";
  const storeContact = (params.storeContact as string) || "";
  const storeImage = (params.storeImage as string) || "";

  // Zustand stores
  const { shops, fetchShops } = useShopStore();
  const { createOrder, isLoading: isOrderSubmitting } = useOrderStore();
  const {
    products,
    fetchProducts,
    categories,
    fetchCategories,
    isLoading: productsLoading,
  } = useProductStore();

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(
    storeIdParam ? parseInt(storeIdParam) : null,
  );
  const [selectedStoreName, setSelectedStoreName] = useState(preSelectedStore);

  const [currentStep, setCurrentStep] = useState(0);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [isChangingStore, setIsChangingStore] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Selfie & Location capture states
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureSelfieUri, setCaptureSelfieUri] = useState<string | null>(null);
  const [captureLocation, setCaptureLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [captureLocationLoading, setCaptureLocationLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchShops(),
        fetchProducts(),
        fetchCategories()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    fetchShops();
    fetchProducts();
    fetchCategories();
  }, []);

  const selectedStoreData = useMemo(() => {
    const id =
      selectedStoreId || (storeIdParam ? parseInt(storeIdParam) : null);
    return shops.find((s) => s.id === id);
  }, [shops, selectedStoreId, storeIdParam]);

  const filteredShops = useMemo(() => {
    return shops.filter((s) =>
      s.shop_name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(storeSearch.toLowerCase()))
    );
  }, [shops, storeSearch]);

  const filteredModalProducts = useMemo(() => {
    return products.filter((p) => {
      const brandName = p.brand?.name || "";
      const matchesSearch =
        p.product_name.toLowerCase().includes(modalSearch.toLowerCase()) ||
        brandName.toLowerCase().includes(modalSearch.toLowerCase());
      const matchesCategory = selectedCategoryId
        ? p.brand?.category_id === selectedCategoryId ||
          p.category_id === selectedCategoryId
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, modalSearch, selectedCategoryId]);

  const toggleProduct = (product: any) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(cart.filter((c) => c.id !== product.id));
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.product_name,
          brand: product.brand?.name || "",
          qty: 1,
        },
      ]);
    }
  };

  const updateQty = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  // Open selfie + location capture modal instead of calling API directly
  const handlePlaceOrder = async () => {
    if (!selectedStoreId && !storeIdParam) {
      setModalConfig({
        visible: true,
        type: "error",
        title: "Error",
        message: "Please select a store",
      });
      return;
    }
    if (cart.length === 0) {
      setModalConfig({
        visible: true,
        type: "error",
        title: "Error",
        message: "Please add at least one product",
      });
      return;
    }

    // Reset capture state and open the modal
    setCaptureSelfieUri(null);
    setCaptureLocation(null);

    // Request permissions
    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setModalConfig({
        visible: true,
        type: "error",
        title: "Permission Denied",
        message: "Location permission is required to place an order.",
      });
      return;
    }

    // Auto-fetch location
    setCaptureLocationLoading(true);
    setShowCaptureModal(true);
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCaptureLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    } catch (error) {
      console.log("Location error:", error);
    }
    setCaptureLocationLoading(false);
  };

  const takeCapturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setCaptureSelfieUri(photo.uri);
    }
  };

  const submitOrderWithCapture = async () => {
    if (!captureSelfieUri) {
      setModalConfig({
        visible: true,
        type: "error",
        title: "Required",
        message: "Please take a selfie before placing the order.",
      });
      return;
    }
    if (!captureLocation) {
      setModalConfig({
        visible: true,
        type: "error",
        title: "Required",
        message: "Location not captured yet.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("shop_id", String(selectedStoreId || storeIdParam));
    if (note) formData.append("notes", note);
    formData.append("latitude", String(captureLocation.lat));
    formData.append("longitude", String(captureLocation.lng));
    
    cart.forEach((item, index) => {
      formData.append(`items[${index}][product_id]`, String(item.id));
      formData.append(`items[${index}][quantity]`, String(item.qty));
    });

    if (captureSelfieUri) {
      formData.append("image", {
        uri: captureSelfieUri,
        type: "image/jpeg",
        name: "order.jpg",
      } as any);
    }

    try {
      await createOrder(formData);
      useDashboardStore.getState().markStoreAsVisitedLocally(selectedStoreId || parseInt(storeIdParam));
      setModalConfig({
        visible: true,
        type: "success",
        title: "Success",
        message: "Order placed successfully!",
      });
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      setModalConfig({
        visible: true,
        type: "error",
        title: "Failed",
        message: "Failed to place order. Please try again.",
      });
    }
  };

  const getStoreImageUrl = (item: any) => {
    if (!item)
      return "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&auto=format&fit=crop";
    if (item.images && item.images.length > 0) {
      const url = item.images[0].image_url;
      return url.startsWith("http")
        ? url
        : `${IMAGE_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&auto=format&fit=crop";
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!selectedStoreId && !storeIdParam) {
        setModalConfig({
          visible: true,
          type: "error",
          title: "Required",
          message: "Please select a store first.",
        });
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (cart.length === 0) {
        setModalConfig({
          visible: true,
          type: "error",
          title: "Required",
          message: "Please add at least one product.",
        });
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const renderStoreProfileCard = () => {
    const name = fromStore ? preSelectedStore : selectedStoreName;
    const cat = fromStore ? storeCategory : selectedStoreData?.category || "";
    const phone = fromStore ? storeContact : selectedStoreData?.contact || "";
    const addr = fromStore
      ? "Address from parameters"
      : selectedStoreData?.address || "";
    const img = fromStore ? storeImage : getStoreImageUrl(selectedStoreData);

    if (!name) return null;

    return (
      <View style={styles.storeCard}>
        <View style={styles.rowCenter}>
          <Image source={{ uri: img }} style={styles.storeImg} />
          <View style={styles.flex1}>
            <View
              style={[styles.rowCenter, { justifyContent: "space-between" }]}
            >
              <Text style={styles.storeNameText} numberOfLines={1}>
                {name}
              </Text>
              {!fromStore && (
                <TouchableOpacity
                  onPress={() => setIsChangingStore(true)}
                  style={styles.changeBtn}
                >
                  <MaterialIcons name="edit" size={16} color="#1A3F75" />
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.rowCenter}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
              <Text style={styles.phoneText}>{phone}</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.rowCenter}>
          <MaterialIcons name="location-on" size={13} color="#9CA3AF" />
          <Text style={styles.addressText} numberOfLines={1}>
            {selectedStoreData?.address || addr}
          </Text>
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.flex1}>
      {!fromStore && (!selectedStoreId || isChangingStore) ? (
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Select Store *</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setShowStoreDropdown(!showStoreDropdown)}
          >
            <View style={styles.rowCenter}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="store" size={20} color="#4C73B6" />
              </View>
              <Text
                style={[
                  styles.dropdownValue,
                  !selectedStoreName && { color: "#9CA3AF" },
                ]}
              >
                {selectedStoreName || "Choose a store..."}
              </Text>
            </View>
            <Ionicons
              name={showStoreDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
          {showStoreDropdown && (
            <View style={styles.dropdownMenu}>
              <View style={styles.dropdownSearchContainer}>
                <Ionicons name="search" size={16} color="#94A3B8" />
                <TextInput
                  placeholder="Search stores..."
                  style={styles.dropdownSearchInput}
                  value={storeSearch}
                  onChangeText={setStoreSearch}
                  placeholderTextColor="#94A3B8"
                />
                {storeSearch !== "" && (
                  <TouchableOpacity onPress={() => setStoreSearch("")}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView
                style={{ maxHeight: scale(300) }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {filteredShops.length > 0 ? (
                  filteredShops.map((store) => (
                    <TouchableOpacity
                      key={store.id}
                      style={[
                        styles.dropdownItem,
                        selectedStoreId === store.id && {
                          backgroundColor: "#EFF6FF",
                        },
                      ]}
                      onPress={() => {
                        setSelectedStoreId(store.id);
                        setSelectedStoreName(store.shop_name);
                        setShowStoreDropdown(false);
                        setIsChangingStore(false);
                        setStoreSearch("");
                      }}
                    >
                      <Image
                        source={{ uri: getStoreImageUrl(store) }}
                        style={styles.smallAvatar}
                      />
                      <View style={styles.flex1} className="ml-2">
                        <Text style={styles.itemTitle}>{store.shop_name}</Text>
                        <Text style={styles.itemSubtitle}>{store.category}</Text>
                      </View>
                      {selectedStoreId === store.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#4C73B6"
                        />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.dropdownEmptyState}>
                    <Text style={styles.dropdownEmptyText}>No stores found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      ) : (
        (selectedStoreId || storeIdParam) && renderStoreProfileCard()
      )}

      <View style={styles.rowGap}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Delivery Date</Text>
          <TouchableOpacity
            style={styles.datePickerTrigger}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#4C73B6" />
            <Text style={styles.dateText}>
              {deliveryDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Notes</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            placeholder="Add special instructions..."
            multiline
            numberOfLines={3}
            style={styles.textArea}
            textAlignVertical="top"
            placeholderTextColor={"#ccc"}
            value={note}
            onChangeText={setNote}
          />
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={deliveryDate}
          mode="date"
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setDeliveryDate(date);
          }}
        />
      )}
    </View>
  );

  const renderStep2 = () => {
    if (productsLoading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1A3F75" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      );
    }

    return (
      <View style={styles.flex1}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Search medicine or brand..."
              style={styles.searchInput}
              value={modalSearch}
              placeholderTextColor="#ccc"
              onChangeText={setModalSearch}
            />
            {modalSearch !== "" && (
              <TouchableOpacity onPress={() => setModalSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.categoryScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategoryId === null && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategoryId(null)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategoryId === null && styles.categoryTabTextActive,
                ]}
              >
                All Items
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryTab,
                  selectedCategoryId === cat.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategoryId === cat.id &&
                      styles.categoryTabTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.productListContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="transparent"
                colors={["transparent"]}
                style={{ backgroundColor: "transparent" }}
                progressBackgroundColor="transparent"
                progressViewOffset={-1000}
              />
            }
          >
            {filteredModalProducts.length > 0 ? (
              filteredModalProducts.map((product, idx) => {
                const cartItem = cart.find((c) => c.id === product.id);
                const isSelected = !!cartItem;
                return (
                  <View
                    key={product.id}
                    style={[
                      styles.productListItem,
                      idx !== filteredModalProducts.length - 1 &&
                        styles.borderBottom,
                    ]}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {product.product_name}
                      </Text>
                      <Text style={styles.productBrand}>
                        {product.brand?.name || "No Brand"}
                      </Text>
                    </View>
                    <View style={styles.qtyContainer}>
                      {isSelected ? (
                        <View style={styles.rowCenter}>
                          <TouchableOpacity
                            style={styles.qtyBtnSmall}
                            onPress={() => updateQty(product.id, -1)}
                          >
                            {cartItem.qty === 1 ? (
                              <Feather name="trash-2" size={14} color="#EF4444" />
                            ) : (
                              <Feather name="minus" size={14} color="#4C73B6" />
                            )}
                          </TouchableOpacity>
                          <Text style={styles.qtyTextSmall}>
                            {String(cartItem.qty).padStart(2, "0")}
                          </Text>
                          <TouchableOpacity
                            style={styles.qtyBtnSmall}
                            onPress={() => updateQty(product.id, 1)}
                          >
                            <Feather name="plus" size={14} color="#4C73B6" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addBtnSmall}
                          onPress={() => toggleProduct(product)}
                        >
                          <Text style={styles.addBtnTextSmall}>ADD</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>
                  No products match your search
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.flex1}>
      <Text style={styles.labelCaps}>Order Summary</Text>
      <View style={styles.summaryStoreCard}>
        <View style={styles.summaryIconBox}>
          <MaterialIcons name="store" size={24} color="#1A3F75" />
        </View>
        <View style={[styles.flex1, { marginLeft: 16 }]}>
          <Text style={styles.summaryStoreName}>{selectedStoreName}</Text>
          <Text style={styles.summaryDetails}>
            {deliveryDate.toLocaleDateString()} • {note || "No notes"}
          </Text>
        </View>














        
      </View>

      <View style={[styles.itemListContainer, { flex: 1, marginBottom: 0 }]}>
        <View style={styles.itemListHeader}>
          <Text style={styles.itemListTitle}>Items List ({cart.length})</Text>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {cart.map((item, idx) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                idx !== cart.length - 1 && styles.borderBottom,
              ]}
            >
              <View style={styles.itemIdxBox}>
                <Text style={styles.itemIdxText}>
                  {String(idx + 1).padStart(2, "0")}
                </Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.itemRowName}>{item.name}</Text>
                <Text style={styles.itemRowBrand}>{item.brand}</Text>
              </View>
              <Text style={styles.itemRowQty}>
                x {item.qty < 10 ? `0${item.qty}` : item.qty}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1A3F75", "#2D5A9E"]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Order</Text>
          <Text style={styles.headerStepText}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <React.Fragment key={step}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted
                        ? { backgroundColor: "#059669" }
                        : isActive
                          ? { backgroundColor: "white" }
                          : { backgroundColor: "rgba(255,255,255,0.2)" },
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          isActive
                            ? { color: "#1A3F75" }
                            : { color: "rgba(255,255,255,0.6)" },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive || isCompleted
                        ? { color: "white" }
                        : { color: "rgba(255,255,255,0.4)" },
                    ]}
                  >
                    {step}
                  </Text>
                </View>
                {index < STEPS.length - 1 && (
                  <View style={styles.stepChevron}>
                    <View
                      style={{
                        width: 32,
                        height: 2,
                        backgroundColor: "rgba(255,255,255,0.4)",
                      }}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {currentStep === 0 && (
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderStep1()}
          </ScrollView>
        )}
        {currentStep === 1 && (
          <View style={[styles.flex1, styles.scrollContent, { paddingBottom: 10 }]}>
            {renderStep2()}
          </View>
        )}
        {currentStep === 2 && (
          <View style={[styles.flex1, styles.scrollContent, { paddingBottom: 10 }]}>
            {renderStep3()}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      {!isKeyboardVisible && (
        <View
          style={[
            styles.bottomNav,
            { paddingBottom: insets.bottom + scale(16) },
          ]}
        >
          {currentStep > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={handlePrevious}>
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={currentStep === 2 ? handlePlaceOrder : handleNext}
            disabled={isOrderSubmitting}
          >
            {isOrderSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.nextBtnText}>
                {currentStep === 2 ? "Place Order" : "Next Step"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ===== SELFIE & LOCATION CAPTURE MODAL ===== */}
      <Modal
        visible={showCaptureModal}
        animationType="slide"
        transparent={false}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          <View className="flex-1">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-[#1E293B]">
                Verify & Place Order
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCaptureSelfieUri(null);
                  setCaptureLocation(null);
                  setShowCaptureModal(false);
                }}
                className="bg-gray-100 p-2 rounded-full"
              >
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Camera Section */}
            <View className="px-5 mt-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-2">
                Take a Selfie
              </Text>
              <View
                className="bg-gray-100 mb-2 border border-gray-200"
                style={{
                  height: 300,
                  width: Dimensions.get("window").width - 40,
                  overflow: "hidden",
                  borderRadius: Platform.OS === "ios" ? 16 : 0,
                }}
              >
                {captureSelfieUri ? (
                  <View style={{ flex: 1 }}>
                    <Image
                      source={{ uri: captureSelfieUri }}
                      style={{ flex: 1 }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute bottom-3 right-3 bg-white/90 px-4 py-2 rounded-xl"
                      onPress={() => setCaptureSelfieUri(null)}
                    >
                      <Text className="text-[#1A3F75] font-bold text-xs">
                        Retake
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : cameraPermission?.granted ? (
                  <View
                    style={{
                      width: Dimensions.get("window").width - 40,
                      height: 300,
                      position: "relative",
                    }}
                  >
                    {showCaptureModal && (
                      <CameraView
                        ref={cameraRef}
                        style={{
                          width: Dimensions.get("window").width - 40,
                          height: 300,
                        }}
                        facing="front"
                      />
                    )}
                    <TouchableOpacity
                      className="absolute bottom-4 self-center w-16 h-16 rounded-full bg-white border-4 border-[#1A3F75] items-center justify-center shadow-lg"
                      onPress={takeCapturePhoto}
                    >
                      <View className="w-12 h-12 rounded-full bg-[#1A3F75]" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <MaterialIcons name="camera-alt" size={40} color="#9CA3AF" />
                    <Text className="text-gray-400 mt-2 text-sm">
                      Camera permission required
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Location Section */}
            <ScrollView className="px-5 mt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <View className="mb-4">
                <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2 tracking-wider">
                  Location Status
                </Text>
                <View className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                  {captureLocationLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#1A3F75" />
                      <Text className="ml-3 text-[#1A3F75] font-medium text-[14px]">
                        Capturing precise location...
                      </Text>
                    </View>
                  ) : captureLocation ? (
                    <View>
                      <View className="flex-row items-center mb-1">
                        <MaterialIcons name="location-on" size={18} color="#059669" />
                        <Text className="ml-2 text-green-700 font-bold text-[14px]">
                          Location captured successfully
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-[12px] ml-6">
                        Lat: {captureLocation.lat.toFixed(6)}, Lng: {captureLocation.lng.toFixed(6)}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <MaterialIcons name="location-off" size={18} color="#DC2626" />
                      <Text className="ml-2 text-red-600 font-bold text-[14px]">
                        Unable to capture location
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <View
                className="px-5 pt-3"
                style={{
                  paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : insets.bottom + 20,
                }}
              >
                <TouchableOpacity
                  className={`py-4 rounded-2xl items-center shadow-sm ${
                    captureSelfieUri && captureLocation ? "bg-[#1A3F75]" : "bg-gray-200"
                  }`}
                  onPress={submitOrderWithCapture}
                  disabled={isOrderSubmitting || !captureSelfieUri || !captureLocation}
                >
                  {isOrderSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      className={`text-[16px] font-bold ${!captureSelfieUri || !captureLocation ? "text-gray-400" : "text-white"}`}
                    >
                      Confirm & Place Order
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <StatusModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      {/* Full Screen Loading Overlay */}
      {refreshing && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 9999, justifyContent: 'center', alignItems: 'center' }}>
          <LottieView
            source={require("../../assets/animation/pill-optimized.json")}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  flex1: { flex: 1 },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  header: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(24),
    paddingTop: Platform.OS === "ios" ? scale(60) : scale(50),
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(20),
  },
  headerTitle: {
    color: "white",
    fontSize: moderateScale(20),
    fontWeight: "bold",
    flex: 1,
    marginLeft: scale(12),
  },
  headerStepText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(12),
    fontWeight: "bold",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: scale(12),
  },
  stepCircle: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { fontSize: moderateScale(12), fontWeight: "800" },
  stepLabel: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    marginLeft: scale(8),
  },
  stepChevron: { justifyContent: "center", marginRight: scale(12) },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(20),
    paddingBottom: scale(160),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: scale(10),
    marginLeft: scale(4),
    letterSpacing: 0.5,
  },
  labelCaps: {
    fontSize: moderateScale(11),
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: scale(12),
    marginLeft: scale(4),
    letterSpacing: 0.5,
  },
  fieldContainer: { marginBottom: scale(20), marginTop: scale(20) },
  dropdownTrigger: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownValue: {
    marginLeft: scale(12),
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#1E293B",
  },
  iconCircle: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownMenu: {
    backgroundColor: "white",
    borderRadius: scale(16),
    marginTop: scale(6),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownItem: {
    padding: scale(16),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },
  dropdownSearchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: moderateScale(14),
    color: "#1E293B",
    padding: 0,
  },
  dropdownEmptyState: {
    padding: scale(20),
    alignItems: "center",
  },
  dropdownEmptyText: {
    color: "#94A3B8",
    fontSize: moderateScale(14),
  },
  smallAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#F1F5F9",
  },
  itemTitle: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#1E293B",
  },
  itemSubtitle: {
    fontSize: moderateScale(10),
    color: "#94A3B8",
    marginTop: scale(2),
  },
  storeCard: {
    backgroundColor: "white",
    padding: scale(10),
    borderRadius: scale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(6),
  },
  storeImg: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(12),
    backgroundColor: "#F1F5F9",
    marginRight: scale(12),
  },
  storeNameText: {
    fontSize: moderateScale(13),
    fontWeight: "bold",
    color: "#1E293B",
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(8),
  },
  categoryText: {
    fontSize: moderateScale(10),
    color: "#4C73B6",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  phoneText: {
    fontSize: moderateScale(12),
    color: "#64748B",
    marginLeft: scale(10),
  },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: scale(10) },
  addressText: {
    fontSize: moderateScale(10),
    color: "#64748B",
    marginLeft: scale(8),
    flex: 1,
    lineHeight: 12,
  },
  rowGap: { flexDirection: "row", gap: scale(12), marginTop: scale(4) },
  datePickerTrigger: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(12),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateText: {
    fontSize: moderateScale(13),
    color: "#1E293B",
    fontWeight: "600",
    marginLeft: scale(8),
  },
  textAreaContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: scale(16),
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textArea: {
    fontSize: moderateScale(13),
    color: "black",
    minHeight: scale(70),
    lineHeight: 16,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(100),
  },
  loadingText: {
    color: "#94A3B8",
    marginTop: scale(16),
    fontSize: moderateScale(15),
  },
  searchContainer: {
    backgroundColor: "white",
    borderRadius: scale(16),
    padding: scale(8),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(12),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: moderateScale(13),
    color: "#1E293B",
  },
  categoryScroll: { marginBottom: scale(12) },
  categoryTab: {
    paddingHorizontal: scale(18),
    paddingVertical: scale(10),
    borderRadius: scale(24),
    marginRight: scale(10),
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryTabText: {
    fontSize: moderateScale(11),
    fontWeight: "bold",
    color: "#64748B",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(8),
    marginBottom: scale(6),
    borderRadius: scale(20),
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  productCardSelected: { borderColor: "#4C73B6", backgroundColor: "#F0F7FF" },
  productName: {
    fontSize: moderateScale(12),
    fontWeight: "bold",
    color: "#1E293B",
  },
  productBrand: {
    fontSize: moderateScale(10),
    color: "#64748B",
    marginTop: scale(2),
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  qtyBtn: {
    width: scale(40),
    height: scale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: moderateScale(12),
    fontWeight: "bold",
    color: "#1A3F75",
    marginHorizontal: scale(4),
  },
  addBtn: {
    backgroundColor: "#1A3F75",
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: scale(10),
  },
  addBtnText: {
    color: "white",
    fontSize: moderateScale(13),
    fontWeight: "bold",
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: scale(8),
  },
  changeBtnText: {
    fontSize: moderateScale(11),
    color: "#1A3F75",
    fontWeight: "700",
    marginLeft: scale(4),
  },
  categoryScrollContainer: {
    marginBottom: scale(12),
  },
  categoryScrollContent: {
    paddingRight: scale(20),
  },
  categoryTabActive: {
    backgroundColor: "#1A3F75",
    borderColor: "#1A3F75",
  },
  categoryTabTextActive: {
    color: "white",
  },
  productListContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    paddingHorizontal: scale(12),
  },
  productListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(12),
  },
  productInfo: {
    flex: 1,
  },
  qtyBtnSmall: {
    width: scale(32),
    height: scale(32),
    alignItems: "center",
    justifyContent: "center",
  },
  qtyTextSmall: {
    fontSize: moderateScale(12),
    fontWeight: "bold",
    color: "#1A3F75",
    marginHorizontal: scale(4),
    minWidth: scale(20),
    textAlign: "center",
  },
  addBtnSmall: {
    backgroundColor: "#1A3F75",
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: scale(8),
  },
  addBtnTextSmall: {
    color: "white",
    fontSize: moderateScale(11),
    fontWeight: "bold",
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: scale(100),
    backgroundColor: "white",
    borderRadius: scale(24),
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },
  emptyText: {
    color: "#94A3B8",
    marginTop: scale(16),
    fontWeight: "600",
    fontSize: moderateScale(15),
  },
  summaryStoreCard: {
    backgroundColor: "white",
    padding: scale(20),
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(20),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryIconBox: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryStoreName: {
    fontSize: moderateScale(13),
    fontWeight: "bold",
    color: "#1E293B",
  },
  summaryDetails: {
    fontSize: moderateScale(11),
    color: "#64748B",
    marginTop: scale(2),
  },
  itemListContainer: {
    backgroundColor: "white",
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    paddingBottom: scale(10),
    marginBottom: scale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemListHeader: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  itemListTitle: {
    fontSize: moderateScale(12),
    fontWeight: "bold",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemRow: { flexDirection: "row", alignItems: "center", padding: scale(8) },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  itemIdxBox: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(10),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(16),
  },
  itemIdxText: {
    fontSize: moderateScale(13),
    fontWeight: "bold",
    color: "#64748B",
  },
  itemRowName: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#1E293B",
  },
  itemRowBrand: {
    fontSize: moderateScale(10),
    color: "#94A3B8",
    marginTop: scale(2),
  },
  itemRowQty: {
    fontSize: moderateScale(13),
    fontWeight: "bold",
    color: "#4C73B6",
    marginLeft: scale(10),
  },
  bottomNav: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    flexDirection: "row",
    gap: scale(12),
  },
  prevBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: scale(14),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  prevBtnText: {
    color: "#4B5563",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  nextBtn: {
    flex: 1,
    backgroundColor: "#1A3F75",
    paddingVertical: scale(14),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
});
