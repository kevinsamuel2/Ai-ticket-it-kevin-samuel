import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCarga } from "../../hooks/useCarga";
import { crearEvento, listarCategorias } from "../../services/eventos.service";
import { mensajeDeError } from "../../services/api";
import { Campo } from "../../components/Campo";
import { Boton } from "../../components/Boton";
import { Chips } from "../../components/Chips";
import { armarFecha, hayErrores, validarEvento } from "../../utils/validaciones";
import { colores, espaciado, radio, texto } from "../../theme";

const tipoVacio = () => ({ nombre: "", descripcion: "", precio: "", cupo: "" });

// Publicar un evento con distintos tipos de entrada, cada uno con su precio y cupo
export default function NuevoEvento() {
  const router = useRouter();
  const { datos: categorias } = useCarga(useCallback(() => listarCategorias(), []));
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    categoria: null,
    fecha: "",
    hora: "21:00",
    imagen: "",
    tiposEntrada: [{ ...tipoVacio(), nombre: "General" }],
  });
  const [errores, setErrores] = useState({});
  const [errorDelServidor, setErrorDelServidor] = useState(null);
  const [publicando, setPublicando] = useState(false);

  const cambiar = (campo) => (valor) => setFormulario((anterior) => ({ ...anterior, [campo]: valor }));

  // Actualización inmutable: se crea una lista nueva en vez de modificar la del estado
  const cambiarTipo = (indice, campo) => (valor) =>
    setFormulario((anterior) => ({
      ...anterior,
      tiposEntrada: anterior.tiposEntrada.map((tipo, i) => (i === indice ? { ...tipo, [campo]: valor } : tipo)),
    }));
  const agregarTipo = () =>
    setFormulario((anterior) => ({ ...anterior, tiposEntrada: [...anterior.tiposEntrada, tipoVacio()] }));
  const quitarTipo = (indice) =>
    setFormulario((anterior) => ({
      ...anterior,
      tiposEntrada: anterior.tiposEntrada.filter((_, i) => i !== indice),
    }));

  const publicar = async () => {
    const erroresDeValidacion = validarEvento(formulario);
    setErrores(erroresDeValidacion);
    setErrorDelServidor(null);
    if (hayErrores(erroresDeValidacion)) return;

    setPublicando(true);
    try {
      const evento = await crearEvento({
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        categoriaId: formulario.categoria,
        fecha: armarFecha(formulario.fecha, formulario.hora).toISOString(),
        multimedia: formulario.imagen.trim() ? [formulario.imagen.trim()] : [],
        tiposEntrada: formulario.tiposEntrada.map((tipo) => ({
          nombre: tipo.nombre.trim(),
          descripcion: tipo.descripcion.trim(),
          precio: Number(tipo.precio),
          cupo: Number(tipo.cupo),
        })),
      });
      router.replace(`/eventos/${evento.id}`);
    } catch (e) {
      setErrorDelServidor(mensajeDeError(e));
    } finally {
      setPublicando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenedor} keyboardShouldPersistTaps="handled">
        <Campo
          etiqueta="Nombre del evento"
          value={formulario.nombre}
          onChangeText={cambiar("nombre")}
          error={errores.nombre}
          placeholder="Ej: Noche de Rock Nacional"
        />
        <Campo
          etiqueta="Descripción"
          value={formulario.descripcion}
          onChangeText={cambiar("descripcion")}
          error={errores.descripcion}
          placeholder="Contá de qué se trata, dónde es, qué incluye..."
          multiline
        />

        <View style={styles.grupo}>
          <Text style={styles.etiqueta}>Categoría</Text>
          <View style={styles.sinMargen}>
            <Chips
              etiquetaAccesible="Categoría"
              opciones={(categorias ?? []).map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
              seleccionada={formulario.categoria}
              onSeleccionar={cambiar("categoria")}
            />
          </View>
          {errores.categoria && <Text style={styles.error}>{errores.categoria}</Text>}
        </View>

        <View style={styles.fila}>
          <Campo
            style={styles.flex}
            etiqueta="Fecha"
            value={formulario.fecha}
            onChangeText={cambiar("fecha")}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
          />
          <Campo
            style={styles.hora}
            etiqueta="Hora"
            value={formulario.hora}
            onChangeText={cambiar("hora")}
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        {errores.fecha && <Text style={styles.error}>{errores.fecha}</Text>}

        <Campo
          etiqueta="Imagen (opcional)"
          value={formulario.imagen}
          onChangeText={cambiar("imagen")}
          placeholder="https://..."
          autoCapitalize="none"
          keyboardType="url"
          ayuda="URL de una imagen para mostrar el evento"
        />

        <View style={styles.grupo}>
          <Text style={texto.subtitulo}>Tipos de entrada</Text>
          {formulario.tiposEntrada.map((tipo, indice) => {
            const erroresDelTipo = errores.tiposEntrada?.[indice] ?? {};
            return (
              <View key={indice} style={styles.tipo}>
                <View style={styles.filaEntre}>
                  <Text style={styles.etiqueta}>Entrada {indice + 1}</Text>
                  {formulario.tiposEntrada.length > 1 && (
                    <Pressable
                      onPress={() => quitarTipo(indice)}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar entrada ${indice + 1}`}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={20} color={colores.peligro} />
                    </Pressable>
                  )}
                </View>
                <Campo
                  etiqueta="Nombre"
                  value={tipo.nombre}
                  onChangeText={cambiarTipo(indice, "nombre")}
                  error={erroresDelTipo.nombre}
                  placeholder="General, Platea, VIP..."
                />
                <Campo
                  etiqueta="Descripción (opcional)"
                  value={tipo.descripcion}
                  onChangeText={cambiarTipo(indice, "descripcion")}
                  placeholder="Ubicación, beneficios..."
                />
                <View style={styles.fila}>
                  <Campo
                    style={styles.flex}
                    etiqueta="Precio ($)"
                    value={tipo.precio}
                    onChangeText={cambiarTipo(indice, "precio")}
                    error={erroresDelTipo.precio}
                    placeholder="0 = gratis"
                    keyboardType="numeric"
                  />
                  <Campo
                    style={styles.flex}
                    etiqueta="Cupo"
                    value={tipo.cupo}
                    onChangeText={cambiarTipo(indice, "cupo")}
                    error={erroresDelTipo.cupo}
                    placeholder="Cantidad"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            );
          })}
          {errores.tiposRepetidos && <Text style={styles.error}>{errores.tiposRepetidos}</Text>}
          <Boton titulo="Agregar tipo de entrada" icono="add" variante="secundario" onPress={agregarTipo} />
        </View>

        {errorDelServidor && (
          <Text style={styles.error} accessibilityRole="alert">
            {errorDelServidor}
          </Text>
        )}
        <Boton titulo="Publicar evento" icono="megaphone-outline" onPress={publicar} cargando={publicando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenedor: { padding: espaciado.l, gap: espaciado.l, paddingBottom: espaciado.xl * 2 },
  grupo: { gap: espaciado.s },
  sinMargen: { marginHorizontal: -espaciado.l },
  etiqueta: { fontSize: 14, fontWeight: "600", color: colores.texto },
  fila: { flexDirection: "row", gap: espaciado.m },
  filaEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hora: { width: 110 },
  tipo: {
    gap: espaciado.s,
    padding: espaciado.m,
    borderRadius: radio.l,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderLeftWidth: 4,
    borderLeftColor: colores.primario,
  },
  error: { color: colores.peligro, fontSize: 13 },
});
