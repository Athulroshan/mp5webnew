/**
 * 3D Garment Geometry & UV Mapping Generator for Three.js
 * Generates detailed 3D apparel meshes (T-shirt torso, sleeves, collar, hood, pockets)
 * for multiple garment styles: round-neck, polo, oversized, full-sleeve, half-sleeve, hoodie.
 */
import * as THREE from "three";
import { GarmentStyle } from "@/components/customization/studio/types";

export interface GarmentColors {
  body: string;
  neck?: string;
  sleeves?: string;
  leftSleeve?: string;
  rightSleeve?: string;
  collar?: string;
}

export function createGarmentMesh(
  colors: GarmentColors,
  style: GarmentStyle = "round-neck"
): THREE.Group {
  const garmentGroup = new THREE.Group();
  garmentGroup.name = `garment-group-${style}`;

  // ─── Style specific dimensions ────────────────────────────
  const isHoodie = style === "hoodie";
  const isPolo = style === "polo";
  const isOversized = style === "oversized";
  const isFullSleeve = style === "full-sleeve" || isHoodie;

  const torsoRadius = isOversized ? 1.15 : isHoodie ? 1.18 : 1.0;
  const torsoHeight = isOversized ? 2.6 : isHoodie ? 2.65 : 2.4;
  const sleeveRadius = isOversized ? 0.48 : isHoodie ? 0.44 : 0.42;
  const sleeveLength = isFullSleeve ? 1.85 : isOversized ? 1.1 : 0.9;
  const sleeveDropY = isFullSleeve ? -0.1 : 0.65;
  const sleeveAngleZ = isFullSleeve ? Math.PI / 4 : Math.PI / 3;

  const bodyHex = colors.body || "#ffffff";
  const leftSleeveHex = colors.leftSleeve || colors.sleeves || bodyHex;
  const rightSleeveHex = colors.rightSleeve || colors.sleeves || bodyHex;
  const collarHex = colors.collar || colors.neck || bodyHex;

  // ─── 1. Torso Geometry (Front + Back) ───────────────────────
  const radialSegments = 48;
  const heightSegments = 32;

  const torsoGeo = new THREE.CylinderGeometry(
    torsoRadius * 0.95,
    torsoRadius * 1.05,
    torsoHeight,
    radialSegments,
    heightSegments,
    true
  );

  torsoGeo.scale(1.2, 1.0, 0.65);

  const uvAttr = torsoGeo.attributes.uv;
  const posAttr = torsoGeo.attributes.position;
  const count = uvAttr.count;

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = posAttr.getY(i);
    const normalizedY = (y + torsoHeight / 2) / torsoHeight;

    const angle = Math.atan2(z, x);
    const isFront = z >= 0;

    if (isFront) {
      const normalizedX = (angle + Math.PI / 2) / Math.PI;
      const clampedX = Math.max(0, Math.min(1, normalizedX));
      uvAttr.setXY(i, 0.05 + clampedX * 0.4, 0.05 + normalizedY * 0.4);
    } else {
      const normalizedX = (angle - Math.PI / 2) / Math.PI;
      const clampedX = Math.max(0, Math.min(1, normalizedX));
      uvAttr.setXY(i, 0.55 + clampedX * 0.4, 0.05 + normalizedY * 0.4);
    }
  }
  uvAttr.needsUpdate = true;
  torsoGeo.computeVertexNormals();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(bodyHex),
    roughness: isHoodie ? 0.75 : 0.6,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const torsoMesh = new THREE.Mesh(torsoGeo, bodyMaterial);
  torsoMesh.name = "body-mesh";
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  garmentGroup.add(torsoMesh);

  // ─── 2. Left Sleeve Mesh ──────────────────────────────────
  const sleeveGeoL = new THREE.CylinderGeometry(
    sleeveRadius * 0.85,
    sleeveRadius * (isFullSleeve ? 0.65 : 1.0),
    sleeveLength,
    24,
    16,
    true
  );
  sleeveGeoL.rotateZ(-sleeveAngleZ);
  const sleevePosX = isFullSleeve ? -1.45 : isOversized ? -1.35 : -1.25;
  sleeveGeoL.translate(sleevePosX, sleeveDropY, 0);

  const uvL = sleeveGeoL.attributes.uv;
  for (let i = 0; i < uvL.count; i++) {
    const u = uvL.getX(i);
    const v = uvL.getY(i);
    uvL.setXY(i, 0.05 + u * 0.4, 0.55 + v * 0.4);
  }
  uvL.needsUpdate = true;
  sleeveGeoL.computeVertexNormals();

  const leftSleeveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(leftSleeveHex),
    roughness: isHoodie ? 0.75 : 0.6,
    metalness: 0.05,
  });

  const leftSleeveMesh = new THREE.Mesh(sleeveGeoL, leftSleeveMat);
  leftSleeveMesh.name = "left-sleeve-mesh";
  leftSleeveMesh.castShadow = true;
  garmentGroup.add(leftSleeveMesh);

  // ─── 3. Right Sleeve Mesh ─────────────────────────────────
  const sleeveGeoR = new THREE.CylinderGeometry(
    sleeveRadius * 0.85,
    sleeveRadius * (isFullSleeve ? 0.65 : 1.0),
    sleeveLength,
    24,
    16,
    true
  );
  sleeveGeoR.rotateZ(sleeveAngleZ);
  sleeveGeoR.translate(-sleevePosX, sleeveDropY, 0);

  const uvR = sleeveGeoR.attributes.uv;
  for (let i = 0; i < uvR.count; i++) {
    const u = uvR.getX(i);
    const v = uvR.getY(i);
    uvR.setXY(i, 0.55 + u * 0.4, 0.55 + v * 0.4);
  }
  uvR.needsUpdate = true;
  sleeveGeoR.computeVertexNormals();

  const rightSleeveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(rightSleeveHex),
    roughness: isHoodie ? 0.75 : 0.6,
    metalness: 0.05,
  });

  const rightSleeveMesh = new THREE.Mesh(sleeveGeoR, rightSleeveMat);
  rightSleeveMesh.name = "right-sleeve-mesh";
  rightSleeveMesh.castShadow = true;
  garmentGroup.add(rightSleeveMesh);

  // ─── 4. Neck / Collar / Hood Mesh ────────────────────────
  const neckMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(collarHex),
    roughness: 0.5,
    metalness: 0.08,
  });

  if (isHoodie) {
    // 3D Hood geometry
    const hoodGeo = new THREE.SphereGeometry(0.75, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.75);
    hoodGeo.scale(1.1, 1.3, 1.1);
    hoodGeo.rotateX(Math.PI * 0.15);
    hoodGeo.translate(0, 1.45, -0.2);

    const hoodMesh = new THREE.Mesh(hoodGeo, neckMaterial);
    hoodMesh.name = "neck-mesh";
    hoodMesh.castShadow = true;
    garmentGroup.add(hoodMesh);

    // Kangaroo Pocket
    const pocketGeo = new THREE.BoxGeometry(1.3, 0.7, 0.15);
    pocketGeo.translate(0, -0.65, 0.42);
    const pocketMesh = new THREE.Mesh(pocketGeo, bodyMaterial);
    pocketMesh.name = "pocket-mesh";
    pocketMesh.castShadow = true;
    garmentGroup.add(pocketMesh);

  } else if (isPolo) {
    // 3D Polo Collar Fold
    const poloCollarGeo = new THREE.TorusGeometry(0.58, 0.14, 16, 32, Math.PI * 1.6);
    poloCollarGeo.rotateX(Math.PI / 2 + 0.2);
    poloCollarGeo.scale(1.25, 1.0, 0.85);
    poloCollarGeo.translate(0, 1.18, -0.05);

    const poloCollarMesh = new THREE.Mesh(poloCollarGeo, neckMaterial);
    poloCollarMesh.name = "neck-mesh";
    poloCollarMesh.castShadow = true;
    garmentGroup.add(poloCollarMesh);

    // Placket Strip
    const placketGeo = new THREE.BoxGeometry(0.22, 0.55, 0.06);
    placketGeo.translate(0, 0.88, 0.42);
    const placketMesh = new THREE.Mesh(placketGeo, neckMaterial);
    placketMesh.name = "placket-mesh";
    garmentGroup.add(placketMesh);

  } else {
    // Standard Round-neck Collar Ring
    const collarGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 32);
    collarGeo.rotateX(Math.PI / 2);
    collarGeo.scale(1.3, 1.0, 0.8);
    collarGeo.translate(0, 1.18, 0);

    const collarMesh = new THREE.Mesh(collarGeo, neckMaterial);
    collarMesh.name = "neck-mesh";
    collarMesh.castShadow = true;
    garmentGroup.add(collarMesh);
  }

  // ─── 5. Bottom Hem Trim ──────────────────────────────────
  const hemGeo = new THREE.TorusGeometry(0.95 * (torsoRadius / 1.0), 0.05, 12, 36);
  hemGeo.rotateX(Math.PI / 2);
  hemGeo.scale(1.2, 1.0, 0.65);
  hemGeo.translate(0, -torsoHeight / 2, 0);

  const hemMesh = new THREE.Mesh(hemGeo, neckMaterial);
  hemMesh.name = "hem-mesh";
  garmentGroup.add(hemMesh);

  return garmentGroup;
}

export function createTShirtMesh(colors: GarmentColors): THREE.Group {
  return createGarmentMesh(colors, "round-neck");
}
