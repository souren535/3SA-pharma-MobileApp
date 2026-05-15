import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusModal } from "../../components/ui/status-modal";
import {
  IMAGE_BASE_URL,
  useOrderStore,
  useProductStore,
  useShopStore,
} from "../../store/store";

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
  const [modalSearch, setModalSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

    const payload = {
      shop_id: selectedStoreId || parseInt(storeIdParam),
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.qty,
      })),
      notes: note,
    };

    try {
      await createOrder(payload);
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
            <Text style={styles.storeNameText} numberOfLines={1}>
              {name}
            </Text>
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
      {!fromStore && (
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
              <ScrollView style={{ maxHeight: 250 }}>
                {shops.map((store) => (
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
                    }}
                  >
                    <Image
                      source={{ uri: getStoreImageUrl(store) }}
                      style={styles.smallAvatar}
                    />
                    <View style={styles.flex1}>
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
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {(selectedStoreId || storeIdParam) && renderStoreProfileCard()}

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
              // style={styles.searchInput}
              value={modalSearch}
              className=""
              placeholderTextColor="#ccc"
              onChangeText={setModalSearch}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategoryId === null && { backgroundColor: "#1A3F75" },
            ]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategoryId === null && { color: "white" },
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
                selectedCategoryId === cat.id && { backgroundColor: "#1A3F75" },
              ]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategoryId === cat.id && { color: "white" },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.flex1}>
          {filteredModalProducts.length > 0 ? (
            filteredModalProducts.map((product) => {
              const cartItem = cart.find((c) => c.id === product.id);
              const isSelected = !!cartItem;
              return (
                <View
                  key={product.id}
                  style={[
                    styles.productCard,
                    isSelected && styles.productCardSelected,
                  ]}
                >
                  <View style={styles.flex1}>
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
                          style={styles.qtyBtn}
                          onPress={() => updateQty(product.id, -1)}
                        >
                          <Feather name="minus" size={16} color="#4C73B6" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>
                          {cartItem.qty < 10 ? `0${cartItem.qty}` : cartItem.qty}
                        </Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQty(product.id, 1)}
                        >
                          <Feather name="plus" size={16} color="#4C73B6" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => toggleProduct(product)}
                      >
                        <Text style={styles.addBtnText}>ADD</Text>
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
        <View style={styles.flex1}>
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
          style={{ maxHeight: Platform.OS === 'ios' ? 400 : 350 }}
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
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={[
            styles.scrollContent,
            currentStep === 2 && { paddingBottom: 100 }
          ]}
          scrollEnabled={currentStep !== 2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 0 && renderStep1()}
          {currentStep === 1 && renderStep2()}
          {currentStep === 2 && renderStep3()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      {!isKeyboardVisible && (
        <View style={styles.bottomNav}>
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

      <StatusModal
        visible={modalConfig.visible}
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  flex1: { flex: 1 },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 12,
  },
  headerStepText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "bold",
  },
  stepItem: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { fontSize: 12, fontWeight: "800" },
  stepLabel: { fontSize: 13, fontWeight: "700", marginLeft: 8 },
  stepChevron: { justifyContent: "center", marginRight: 12 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 160 },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  labelCaps: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  fieldContainer: { marginBottom: 20, marginTop: 20 },
  dropdownTrigger: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
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
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownMenu: {
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 6,
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
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  itemSubtitle: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  storeCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 8,
  },
  storeImg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    marginRight: 16,
  },
  storeNameText: { fontSize: 17, fontWeight: "bold", color: "#1E293B" },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    color: "#4C73B6",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  phoneText: { fontSize: 13, color: "#64748B", marginLeft: 12 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 },
  addressText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
  rowGap: { flexDirection: "row", gap: 12, marginTop: 4 },
  datePickerTrigger: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateText: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
    marginLeft: 10,
  },
  textAreaContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textArea: { fontSize: 14, color: "black", minHeight: 80, lineHeight: 18 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: { color: "#94A3B8", marginTop: 16, fontSize: 15 },
  searchContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#1E293B" },
  categoryScroll: { marginBottom: 20 },
  categoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 10,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryTabText: { fontSize: 13, fontWeight: "bold", color: "#64748B" },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 14,
    borderRadius: 20,
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
  productName: { fontSize: 15, fontWeight: "bold", color: "#1E293B" },
  productBrand: { fontSize: 12, color: "#64748B", marginTop: 4 },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  qtyBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A3F75",
    marginHorizontal: 4,
  },
  addBtn: {
    backgroundColor: "#1A3F75",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { color: "white", fontSize: 13, fontWeight: "bold" },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 100,
    backgroundColor: "white",
    borderRadius: 24,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },
  emptyText: {
    color: "#94A3B8",
    marginTop: 16,
    fontWeight: "600",
    fontSize: 15,
  },
  summaryStoreCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryStoreName: { fontSize: 17, fontWeight: "bold", color: "#1E293B" },
  summaryDetails: { fontSize: 13, color: "#64748B", marginTop: 4 },
  itemListContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemListHeader: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  itemListTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemRow: { flexDirection: "row", alignItems: "center", padding: 20 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  itemIdxBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemIdxText: { fontSize: 13, fontWeight: "bold", color: "#64748B" },
  itemRowName: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  itemRowBrand: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  bottomNav: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 12 : 24,
    marginBottom: 40,
    flexDirection: "row",
    gap: 12,
  },
  prevBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  prevBtnText: { color: "#4B5563", fontWeight: "700", fontSize: 14 },
  nextBtn: {
    flex: 1,
    backgroundColor: "#1A3F75",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
});
