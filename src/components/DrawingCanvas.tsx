import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize } from '../constants/typography';

const PALETTE = ['#2C2C2C', '#FF7A5C', '#FFB830', '#5CB85C', '#9B8AC4', '#4A9ABF', '#E8A0BF', '#FFFFFF'];
const BRUSH_SIZES = [3, 6, 12];
const CANVAS_BG = '#FFFDF5';

interface StrokePath {
  d: string;
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  partnerName: string;
  onSend: (paths: string[]) => void;
  onClose: () => void;
}

export function DrawingCanvas({ partnerName, onSend, onClose }: DrawingCanvasProps) {
  const [paths, setPaths] = useState<StrokePath[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [activeColor, setActiveColor] = useState('#2C2C2C');
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[0]);
  const currentRef = useRef('');
  const strokeColorRef = useRef('#2C2C2C');
  const strokeWidthRef = useRef(BRUSH_SIZES[0]);

  // Keep refs in sync with state so panResponder callbacks read latest values
  strokeColorRef.current = isEraser ? CANVAS_BG : activeColor;
  strokeWidthRef.current = isEraser ? 22 : brushSize;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const p = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentRef.current = p;
        setCurrentPath(p);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const p = `${currentRef.current} L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentRef.current = p;
        setCurrentPath(p);
      },
      onPanResponderRelease: () => {
        if (currentRef.current) {
          const stroke: StrokePath = {
            d: currentRef.current,
            color: strokeColorRef.current,
            width: strokeWidthRef.current,
          };
          setPaths((prev) => [...prev, stroke]);
          currentRef.current = '';
          setCurrentPath('');
        }
      },
    })
  ).current;

  const handleUndo = () => setPaths((prev) => prev.slice(0, -1));

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    currentRef.current = '';
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Draw for {partnerName}</Text>
        <TouchableOpacity
          onPress={() => onSend(paths.map((p) => p.d))}
          style={[styles.sendBtn, paths.length === 0 && styles.sendBtnOff]}
          disabled={paths.length === 0}
        >
          <Text style={styles.sendBtnText}>Send ♥</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((p, i) => (
            <Path
              key={i}
              d={p.d}
              stroke={p.color}
              strokeWidth={p.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={strokeColorRef.current}
              strokeWidth={strokeWidthRef.current}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
        {paths.length === 0 && !currentPath && (
          <View style={styles.emptyHint} pointerEvents="none">
            <Text style={styles.emptyEmoji}>✏️</Text>
            <Text style={styles.emptyText}>Draw something for {partnerName}</Text>
          </View>
        )}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        {/* Color palette */}
        <View style={styles.paletteRow}>
          {PALETTE.map((c) => {
            const isActive = !isEraser && activeColor === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  c === '#FFFFFF' && styles.colorSwatchWhite,
                  isActive && styles.colorSwatchActive,
                ]}
                onPress={() => { setActiveColor(c); setIsEraser(false); }}
              />
            );
          })}
          <TouchableOpacity
            style={[styles.eraserBtn, isEraser && styles.eraserBtnActive]}
            onPress={() => setIsEraser((v) => !v)}
          >
            <Text style={styles.eraserIcon}>⌫</Text>
          </TouchableOpacity>
        </View>

        {/* Brush sizes + undo + clear */}
        <View style={styles.toolRow}>
          <View style={styles.brushRow}>
            {BRUSH_SIZES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.brushOption, brushSize === s && !isEraser && styles.brushOptionActive]}
                onPress={() => { setBrushSize(s); setIsEraser(false); }}
              >
                <View
                  style={[
                    styles.brushDot,
                    { width: s * 2.4, height: s * 2.4, borderRadius: s * 2.4 },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleUndo} disabled={paths.length === 0}>
              <Text style={[styles.actionBtnText, paths.length === 0 && { opacity: 0.3 }]}>↩ Undo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.clearBtn]} onPress={handleClear} disabled={paths.length === 0}>
              <Text style={[styles.clearBtnText, paths.length === 0 && { opacity: 0.3 }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary, fontFamily: FontFamily.medium, minWidth: 56 },
  headerTitle: { flex: 1, fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold, textAlign: 'center' },
  sendBtn: {
    backgroundColor: Colors.coral,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 18,
    minWidth: 76,
    alignItems: 'center',
  },
  sendBtnOff: { opacity: 0.35 },
  sendBtnText: { fontSize: FontSize.sm, color: Colors.white, fontFamily: FontFamily.bold },
  canvasWrapper: {
    flex: 1,
    backgroundColor: CANVAS_BG,
    margin: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: { alignItems: 'center', gap: 8, opacity: 0.35, pointerEvents: 'none' },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: FontSize.base, color: Colors.textSecondary, fontFamily: FontFamily.regular },
  toolbar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  paletteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorSwatch: { width: 28, height: 28, borderRadius: 14 },
  colorSwatchWhite: { borderWidth: 1.5, borderColor: Colors.border },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: Colors.charcoal,
    transform: [{ scale: 1.15 }],
  },
  eraserBtn: {
    width: 40,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginLeft: 4,
  },
  eraserBtnActive: { borderColor: Colors.charcoal, backgroundColor: Colors.yellowPale },
  eraserIcon: { fontSize: 15 },
  toolRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brushRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  brushOption: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.creamDark,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  brushOptionActive: { borderColor: Colors.charcoal, backgroundColor: Colors.white },
  brushDot: { backgroundColor: Colors.charcoal },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  actionBtnText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  clearBtn: { borderColor: Colors.error, backgroundColor: '#FFF5F5' },
  clearBtnText: { fontSize: FontSize.sm, color: Colors.error, fontFamily: FontFamily.semibold },
});
