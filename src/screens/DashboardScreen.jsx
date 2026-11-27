import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import MobileHeader from '../components/MobileHeader.jsx';
import { apiFetch } from '../services/apiClient.js';

export default function DashboardScreen() {
  const router = useRouter();

  // Estado del inventario (Pantalla B1)
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('TODOS');
  const [disponible, setDisponible] = useState(false);

  // Estado del Modal de Solicitud (Pantalla B2)
  const [selectedItem, setSelectedItem] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [canchaOActividad, setCanchaOActividad] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = useCallback(async (showSpinner = true) => {
    if (showSpinner) setCargando(true);
    setErrorMsg('');

    try {
      const data = await apiFetch('/api/sports/items');
      const rawList = Array.isArray(data) ? data : data.items || data.data || [];

      const normalized = rawList.map((item) => ({
        id: item.id ?? item._id,
        codigo: item.codigo || 'S/C',
        nombre: item.nombre || 'Material deportivo',
        deporte: item.deporte || 'General',
        estadoFisico: (item.estadoFisico || item['estado Fisico'] || 'BUENO').toUpperCase(),
        cantidadTotal: Number(item.cantidadTotal ?? item.disponibles ?? 0),
        disponibles: Number(item.disponibles ?? 0),
      }));

      setItems(normalized);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo cargar el inventario deportivo.');
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(true);
  }, [fetchItems]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems(false);
  };

  // Deportes únicos para las píldoras de filtro
  const sportCategories = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.deporte).filter(Boolean)));
    return ['TODOS', ...unique];
  }, [items]);

  // Lista filtrada
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSport = selectedSport === 'TODOS' || item.deporte === selectedSport;
      const matchesAvailability = !disponible || item.disponibles > 0;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.nombre.toLowerCase().includes(query) ||
        item.codigo.toLowerCase().includes(query) ||
        item.deporte.toLowerCase().includes(query);

      return matchesSport && matchesAvailability && matchesSearch;
    });
  }, [items, selectedSport, disponible, searchQuery]);

  // Abrir Modal B2
  const handleOpenLoanModal = (item) => {
    setSelectedItem(item);
    setCantidad(1);
    setCanchaOActividad('');
    setModalError('');
  };

  // Enviar Solicitud B2 (POST /api/sports/loans)
  const handleSubmitLoan = async () => {
    if (!selectedItem) return;

    const qty = Number(cantidad);
    if (!Number.isInteger(qty) || qty < 1 || qty > selectedItem.disponibles) {
      setModalError(`Selecciona una cantidad entre 1 y ${selectedItem.disponibles}.`);
      return;
    }

    if (!canchaOActividad.trim()) {
      setModalError('Indica la cancha o actividad donde usarás el material.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      await apiFetch('/api/sports/loans', {
        method: 'POST',
        body: {
          itemId: selectedItem.id,
          cantidad: qty,
          canchaOActividad: canchaOActividad.trim(),
        },
      });

      const requestedName = selectedItem.nombre;
      setSelectedItem(null);
      fetchItems(false);

      Alert.alert(
        '¡Préstamo registrado!',
        `Tu solicitud de "${requestedName}" (${qty} unid.) está ACTIVA. Puedes ver tu Pase QR en Mis Préstamos.`,
        [
          { text: 'Seguir en catálogo', style: 'cancel' },
          { text: 'Ver Mis Préstamos', onPress: () => router.replace('/perfil') },
        ]
      );
    } catch (err) {
      setModalError(err.message || 'No se pudo procesar la solicitud de préstamo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConditionStyle = (condition) => {
    if (condition === 'NUEVO') return { bg: '#DCFCE7', text: '#15803D' };
    if (condition === 'DESGASTADO') return { bg: '#FEF3C7', text: '#B45309' };
    return { bg: '#DBEAFE', text: '#1D4ED8' };
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.eyebrow}>INVENTARIO EN TIEMPO REAL</Text>
      <Text style={styles.pageTitle}>Material Deportivo</Text>

      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar balón, raqueta, código..."
        placeholderTextColor="#94A3B8"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Píldoras por disciplina */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
      >
        {sportCategories.map((sport) => {
          const active = selectedSport === sport;
          return (
            <Pressable
              key={sport}
              style={[styles.pillBtn, active && styles.pillBtnActive]}
              onPress={() => setSelectedSport(sport)}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {sport === 'TODOS' ? 'Todos' : sport}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Filtro rápido de disponibilidad */}
      <Pressable
        style={styles.availToggleRow}
        onPress={() => setDisponible((prev) => !prev)}
      >
        <View style={[styles.checkbox, disponible && styles.checkboxChecked]}>
          {disponible && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.availToggleText}>Mostrar solo material con stock disponible</Text>
      </Pressable>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}
    </View>
  );

  const renderItem = ({ item }) => {
    const inStock = item.disponibles > 0;
    const condColors = getConditionStyle(item.estadoFisico);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.itemCode}>{item.codigo}</Text>
          <View style={[styles.condBadge, { backgroundColor: condColors.bg }]}>
            <Text style={[styles.condText, { color: condColors.text }]}>
              {item.estadoFisico}
            </Text>
          </View>
        </View>

        <Text style={styles.itemName}>{item.nombre}</Text>
        <Text style={styles.itemSport}>Disciplina: {item.deporte}</Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.stockLabel}>Disponibles</Text>
            <Text style={[styles.stockValue, !inStock && styles.stockEmpty]}>
              {inStock ? `${item.disponibles} unid.` : 'Agotado'}
            </Text>
          </View>

          <Pressable
            style={[styles.requestBtn, !inStock && styles.requestBtnDisabled]}
            disabled={!inStock}
            onPress={() => handleOpenLoanModal(item)}
          >
            <Text style={styles.requestBtnText}>
              {inStock ? 'Solicitar →' : 'Sin stock'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <MobileHeader />

      {cargando ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={styles.loadingText}>Cargando inventario UTR...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E11D48" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No se encontraron artículos con los filtros actuales.
            </Text>
          }
        />
      )}

      {/* MODAL PANTALLA B2: SOLICITUD DE PRÉSTAMO */}
      <Modal
        visible={Boolean(selectedItem)}
        transparent
        animationType="slide"
        onRequestClose={() => !isSubmitting && setSelectedItem(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <Text style={styles.eyebrow}>SOLICITUD DE PRÉSTAMO (B2)</Text>
            <Text style={styles.modalTitle}>{selectedItem?.nombre}</Text>
            <Text style={styles.modalSub}>
              Código: {selectedItem?.codigo} · Stock actual:{' '}
              <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                {selectedItem?.disponibles} unid.
              </Text>
            </Text>

            {modalError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{modalError}</Text>
              </View>
            ) : null}

            {/* Selector de Cantidad */}
            <Text style={styles.label}>Cantidad a solicitar</Text>
            <View style={styles.qtyRow}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setCantidad((prev) => Math.max(1, prev - 1))}
                disabled={isSubmitting || cantidad <= 1}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>

              <Text style={styles.qtyValue}>{cantidad}</Text>

              <Pressable
                style={styles.qtyBtn}
                onPress={() =>
                  setCantidad((prev) => Math.min(selectedItem?.disponibles || 1, prev + 1))
                }
                disabled={isSubmitting || cantidad >= (selectedItem?.disponibles || 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>

            {/* Cancha o Actividad */}
            <Text style={styles.label}>Cancha o Actividad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Cancha 1 Fútbol / Torneo Interno"
              placeholderTextColor="#94A3B8"
              value={canchaOActividad}
              onChangeText={(text) => {
                setCanchaOActividad(text);
                if (modalError) setModalError('');
              }}
              editable={!isSubmitting}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setSelectedItem(null)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSubmitLoan}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirmar préstamo</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#64748B', fontSize: 14 },
  listContent: { padding: 16, paddingBottom: 32 },
  listHeader: { marginBottom: 14 },
  eyebrow: { color: '#E11D48', fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  pillsRow: { gap: 8, paddingBottom: 12 },
  pillBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  pillBtnActive: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },
  availToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#E11D48', borderColor: '#E11D48' },
  checkmark: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  availToggleText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemCode: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  condBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  condText: { fontSize: 11, fontWeight: '800' },
  itemName: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  itemSport: { fontSize: 13, color: '#64748B', marginBottom: 14 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  stockLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  stockValue: { fontSize: 15, fontWeight: '800', color: '#15803D' },
  stockEmpty: { color: '#B91C1C' },
  requestBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  requestBtnDisabled: { backgroundColor: '#CBD5E1' },
  requestBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 32, fontSize: 14 },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: { color: '#B91C1C', fontSize: 13 },
  // Modal B2
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  modalSub: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6, marginTop: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  qtyValue: { fontSize: 18, fontWeight: '800', color: '#0F172A', minWidth: 28, textAlign: 'center' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 18,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#334155', fontWeight: '700', fontSize: 14 },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#E11D48',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});