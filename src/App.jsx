import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Bike, MapPin, PackageCheck, Timer, Trophy, Zap } from "lucide-react";

const CITY_SIZE = 42;
const PLAYER_SPEED = 9.5;
const DELIVERY_RADIUS = 2.3;
const GAME_SECONDS = 95;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomPoint(seed = Math.random()) {
  const angle = seed * Math.PI * 2;
  const radius = 10 + ((seed * 997) % 15);
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

function useKeyboard() {
  const keys = useRef({});

  useEffect(() => {
    const down = (event) => {
      keys.current[event.key.toLowerCase()] = true;
    };
    const up = (event) => {
      keys.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return keys;
}

function NeonMaterial({
  color = "#62f6ff",
  emissive = "#19d7ff",
  intensity = 0.8,
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={intensity}
      roughness={0.35}
      metalness={0.45}
    />
  );
}

function Character({ position, direction, isMoving }) {
  const group = useRef();
  const hair = useRef();
  const bag = useRef();

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.set(position[0], position[1], position[2]);
    group.current.rotation.y = direction;
    if (hair.current) hair.current.rotation.z = Math.sin(t * 4) * 0.035;
    if (bag.current)
      bag.current.rotation.x = isMoving ? Math.sin(t * 9) * 0.04 : 0;
  });

  return (
    <group ref={group}>
      <group position={[0, 1.26, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <sphereGeometry args={[0.44, 32, 32]} />
          <meshStandardMaterial color="#d9b69d" roughness={0.55} />
        </mesh>

        <group ref={hair} position={[0, 0.34, 0.01]}>
          {Array.from({ length: 26 }).map((_, index) => {
            const a = (index / 26) * Math.PI * 2;
            const r = index % 3 === 0 ? 0.5 : 0.42;
            const x = Math.cos(a) * r * 0.72;
            const z = Math.sin(a) * r * 0.44;
            const y = 0.05 + Math.sin(index * 1.7) * 0.04;
            return (
              <mesh
                key={index}
                castShadow
                position={[x, y, z]}
                scale={[1.05, 0.72, 0.9]}
              >
                <sphereGeometry args={[0.17 + (index % 4) * 0.018, 14, 14]} />
                <meshStandardMaterial color="#08080b" roughness={0.9} />
              </mesh>
            );
          })}
          <mesh castShadow position={[0, 0.08, 0]} scale={[1.05, 0.52, 0.82]}>
            <sphereGeometry args={[0.44, 24, 24]} />
            <meshStandardMaterial color="#050508" roughness={0.88} />
          </mesh>
        </group>

        <mesh position={[-0.14, 0.03, -0.405]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshBasicMaterial color="#191919" />
        </mesh>
        <mesh position={[0.14, 0.03, -0.405]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshBasicMaterial color="#191919" />
        </mesh>
        <mesh position={[0, -0.14, -0.418]} scale={[1, 0.22, 0.22]}>
          <sphereGeometry args={[0.09, 12, 8]} />
          <meshStandardMaterial color="#8d5f55" roughness={0.7} />
        </mesh>
      </group>

      <mesh castShadow position={[0, 0.64, 0]} scale={[0.58, 0.72, 0.34]}>
        <capsuleGeometry args={[0.34, 0.55, 10, 18]} />
        <meshStandardMaterial
          color="#151827"
          roughness={0.72}
          metalness={0.05}
        />
      </mesh>

      <mesh
        ref={bag}
        castShadow
        position={[0, 0.73, 0.38]}
        scale={[0.56, 0.6, 0.16]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ff365f"
          emissive="#ff1648"
          emissiveIntensity={0.22}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, 0.78, 0.47]}
        rotation={[0, 0, 0]}
        fontSize={0.14}
        color="#fff7cc"
        anchorX="center"
        anchorY="middle"
      >
        ECHO EATS
      </Text>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            castShadow
            position={[side * 0.39, 0.58, -0.02]}
            rotation={[0, 0, side * 0.14]}
          >
            <capsuleGeometry args={[0.075, 0.52, 8, 12]} />
            <meshStandardMaterial color="#d9b69d" roughness={0.58} />
          </mesh>
          <mesh
            castShadow
            position={[side * 0.2, 0.12, 0]}
            rotation={[0, 0, side * 0.08]}
          >
            <capsuleGeometry args={[0.09, 0.66, 8, 12]} />
            <meshStandardMaterial color="#101321" roughness={0.62} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.08, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.025, 10, 48]} />
        <meshStandardMaterial
          color="#65f6ff"
          emissive="#38d9ff"
          emissiveIntensity={0.6}
        />
      </mesh>
      <pointLight
        position={[0, 1.2, -0.8]}
        intensity={0.7}
        color="#ff4c7c"
        distance={4}
      />
    </group>
  );
}

function RoadGrid() {
  return (
    <group>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
      >
        <planeGeometry args={[CITY_SIZE + 18, CITY_SIZE + 18, 1, 1]} />
        <meshStandardMaterial color="#080914" roughness={0.92} />
      </mesh>

      {[-16, -8, 0, 8, 16].map((x) => (
        <mesh
          key={`v${x}`}
          receiveShadow
          position={[x, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[3.1, CITY_SIZE + 10]} />
          <meshStandardMaterial color="#13162a" roughness={0.78} />
        </mesh>
      ))}
      {[-16, -8, 0, 8, 16].map((z) => (
        <mesh
          key={`h${z}`}
          receiveShadow
          position={[0, 0.012, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[CITY_SIZE + 10, 3.1]} />
          <meshStandardMaterial color="#13162a" roughness={0.78} />
        </mesh>
      ))}

      {[-16, -8, 0, 8, 16].map((x) => (
        <group key={`lane${x}`}>
          {Array.from({ length: 12 }).map((_, index) => (
            <mesh
              key={index}
              position={[x, 0.035, -22 + index * 4]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.08, 1.2]} />
              <meshBasicMaterial color="#fff2a6" transparent opacity={0.35} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Building({ x, z, height, color, neon, label }) {
  const windowRows = Math.max(2, Math.floor(height / 1.3));
  return (
    <group position={[x, height / 2, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.8, height, 2.8]} />
        <meshStandardMaterial color={color} roughness={0.63} metalness={0.14} />
      </mesh>
      <mesh position={[0, height / 2 + 0.08, 0]}>
        <boxGeometry args={[3, 0.12, 3]} />
        <NeonMaterial color={neon} emissive={neon} intensity={0.9} />
      </mesh>
      {Array.from({ length: windowRows }).map((_, i) => (
        <mesh key={i} position={[0, -height / 2 + 0.8 + i * 1.05, -1.43]}>
          <boxGeometry args={[1.65, 0.12, 0.04]} />
          <meshBasicMaterial color={neon} transparent opacity={0.48} />
        </mesh>
      ))}
      {label && (
        <Text
          position={[0, 0.15, -1.52]}
          rotation={[0, 0, 0]}
          fontSize={0.28}
          color="#fff8da"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function City() {
  const buildings = useMemo(() => {
    const spots = [];
    const colors = ["#17192e", "#221b34", "#15212f", "#27192b", "#182738"];
    const neons = ["#5df7ff", "#ff4c97", "#ffe070", "#9d7cff", "#55ff99"];
    const labels = ["NOODLE", "PIZZA", "CAFE", "BIRYANI", "RAMEN", "MOMO"];
    let n = 0;
    for (let x = -20; x <= 20; x += 8) {
      for (let z = -20; z <= 20; z += 8) {
        if (Math.abs(x) < 4 || Math.abs(z) < 4) continue;
        const height = 2.2 + ((Math.sin(x * 12.9 + z * 3.1) + 1) / 2) * 6;
        spots.push({
          x: x + Math.sin(z) * 0.7,
          z: z + Math.cos(x) * 0.7,
          height,
          color: colors[Math.abs(Math.floor(x + z)) % colors.length],
          neon: neons[Math.abs(Math.floor(x * z)) % neons.length],
          label: n % 7 === 0 ? labels[n % labels.length] : "",
        });
        n += 1;
      }
    }
    return spots;
  }, []);

  return (
    <group>
      <RoadGrid />
      {buildings.map((building, index) => (
        <Building key={index} {...building} />
      ))}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 6.2, 96]} />
        <meshBasicMaterial
          color="#6af6ff"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function DeliveryMarker({ target, active }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 1.7;
    group.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.12;
  });

  return (
    <group position={[target[0], 0, target[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.5, 1.8, 64]} />
        <meshBasicMaterial
          color={active ? "#ffea79" : "#66f6ff"}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={group}>
        <mesh castShadow position={[0, 1.1, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial
            color={active ? "#ffcf5a" : "#55f0ff"}
            emissive={active ? "#ff7e31" : "#00b7ff"}
            emissiveIntensity={0.7}
            roughness={0.36}
          />
        </mesh>
        <mesh position={[0, 1.58, 0]}>
          <coneGeometry args={[0.36, 0.65, 24]} />
          <meshStandardMaterial
            color="#ff4c7c"
            emissive="#ff1d5e"
            emissiveIntensity={0.75}
          />
        </mesh>
      </group>
      <Text
        position={[0, 2.45, 0]}
        fontSize={0.42}
        color="#fff7d7"
        anchorX="center"
        anchorY="middle"
      >
        DROP HERE
      </Text>
    </group>
  );
}

function FloatingTraffic() {
  const cars = useMemo(() => {
    return Array.from({ length: 8 }).map((_, index) => ({
      lane: [-16, -8, 8, 16][index % 4],
      z: -22 + index * 6,
      speed: 2.5 + (index % 3),
      color: ["#ff4f86", "#5cf7ff", "#ffe16a", "#a077ff"][index % 4],
      horizontal: index % 2 === 0,
    }));
  }, []);

  const refs = useRef([]);
  useFrame((_, delta) => {
    refs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const car = cars[index];
      if (car.horizontal) {
        mesh.position.x += delta * car.speed;
        if (mesh.position.x > 24) mesh.position.x = -24;
      } else {
        mesh.position.z += delta * car.speed;
        if (mesh.position.z > 24) mesh.position.z = -24;
      }
    });
  });

  return (
    <group>
      {cars.map((car, index) => (
        <mesh
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          position={
            car.horizontal ? [-22, 0.22, car.lane] : [car.lane, 0.22, car.z]
          }
          rotation={[0, car.horizontal ? Math.PI / 2 : 0, 0]}
          castShadow
        >
          <boxGeometry args={[1, 0.38, 1.7]} />
          <meshStandardMaterial
            color={car.color}
            emissive={car.color}
            emissiveIntensity={0.25}
            roughness={0.36}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ player }) {
  useFrame(({ camera }) => {
    const desired = new THREE.Vector3(player[0] + 6, 7.8, player[2] + 9);
    camera.position.lerp(desired, 0.075);
    camera.lookAt(player[0], 1.05, player[2]);
  });
  return null;
}

function GameScene({ joystick, onStats }) {
  const keyboard = useKeyboard();
  const player = useRef([0, 0, 0]);
  const direction = useRef(Math.PI);
  const moving = useRef(false);
  const [renderTick, setRenderTick] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [gameState, setGameState] = useState("playing");
  const [target, setTarget] = useState(() => randomPoint(0.19));
  const deliveredRef = useRef(false);

  useEffect(() => {
    if (gameState !== "playing") return undefined;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("ended");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    onStats({ score, streak, timeLeft, gameState });
  }, [score, streak, timeLeft, gameState, onStats]);

  useFrame((_, delta) => {
    if (gameState !== "playing") return;
    const keys = keyboard.current;
    let x = 0;
    let z = 0;
    if (keys.w || keys.arrowup) z -= 1;
    if (keys.s || keys.arrowdown) z += 1;
    if (keys.a || keys.arrowleft) x -= 1;
    if (keys.d || keys.arrowright) x += 1;
    x += joystick.x;
    z += joystick.y;

    const length = Math.hypot(x, z);
    moving.current = length > 0.04;
    if (moving.current) {
      x /= length;
      z /= length;
      player.current[0] = clamp(
        player.current[0] + x * PLAYER_SPEED * delta,
        -CITY_SIZE / 2,
        CITY_SIZE / 2,
      );
      player.current[2] = clamp(
        player.current[2] + z * PLAYER_SPEED * delta,
        -CITY_SIZE / 2,
        CITY_SIZE / 2,
      );
      direction.current = Math.atan2(x, z);
    }

    const dx = player.current[0] - target[0];
    const dz = player.current[2] - target[2];
    const distance = Math.hypot(dx, dz);
    if (distance < DELIVERY_RADIUS && !deliveredRef.current) {
      deliveredRef.current = true;
      const bonus = Math.max(1, streak + 1);
      setScore((s) => s + 100 + bonus * 25);
      setStreak((s) => s + 1);
      setTimeLeft((t) => Math.min(GAME_SECONDS, t + 7));
      setTarget(randomPoint(Math.random()));
      setTimeout(() => {
        deliveredRef.current = false;
      }, 450);
    }

    setRenderTick((t) => (t + 1) % 100000);
  });

  const isMoving = moving.current || Math.hypot(joystick.x, joystick.y) > 0.04;

  return (
    <>
      <color attach="background" args={["#060711"]} />
      <fog attach="fog" args={["#060711", 18, 54]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 12, 7]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[0, 6, 0]}
        intensity={1.2}
        color="#6af6ff"
        distance={24}
      />
      <Stars
        radius={90}
        depth={40}
        count={1200}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <City />
      <FloatingTraffic />
      <DeliveryMarker target={target} active />
      <Character
        position={player.current}
        direction={direction.current}
        isMoving={isMoving}
      />
      <CameraRig player={player.current} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
      />
      {gameState === "ended" && (
        <Html center>
          <div className="rounded-[2rem] border border-white/15 bg-black/70 px-8 py-7 text-center text-white shadow-2xl backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.45em] text-cyan-200/80">
              Shift Complete
            </p>
            <h2 className="mt-2 text-5xl font-black">{score}</h2>
            <p className="mt-2 text-sm text-white/70">
              Your neon delivery run ended. Restart from the panel.
            </p>
          </div>
        </Html>
      )}
    </>
  );
}

function HudCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 shadow-xl backdrop-blur-md">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-cyan-200">
        <Icon size={19} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          {label}
        </p>
        <p className="text-lg font-black leading-none text-white">{value}</p>
      </div>
    </div>
  );
}

function TouchControls({ setJoystick }) {
  const [active, setActive] = useState({ x: 0, y: 0 });

  const press = (x, y) => {
    setActive({ x, y });
    setJoystick({ x, y });
  };
  const release = () => {
    setActive({ x: 0, y: 0 });
    setJoystick({ x: 0, y: 0 });
  };

  const buttonClass =
    "grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black text-white shadow-xl backdrop-blur-lg active:scale-95";

  return (
    <div
      className="pointer-events-auto grid grid-cols-3 gap-2 md:hidden"
      onPointerLeave={release}
    >
      <div />
      <button
        className={buttonClass}
        aria-pressed={active.y === -1}
        onPointerDown={() => press(0, -1)}
        onPointerUp={release}
      >
        ↑
      </button>
      <div />
      <button
        className={buttonClass}
        aria-pressed={active.x === -1}
        onPointerDown={() => press(-1, 0)}
        onPointerUp={release}
      >
        ←
      </button>
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-xs font-black uppercase tracking-widest text-cyan-100">
        Move
      </div>
      <button
        className={buttonClass}
        aria-pressed={active.x === 1}
        onPointerDown={() => press(1, 0)}
        onPointerUp={release}
      >
        →
      </button>
      <div />
      <button
        className={buttonClass}
        aria-pressed={active.y === 1}
        onPointerDown={() => press(0, 1)}
        onPointerUp={release}
      >
        ↓
      </button>
      <div />
    </div>
  );
}

export default function FoodDelivery3DGame() {
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({
    score: 0,
    streak: 0,
    timeLeft: GAME_SECONDS,
    gameState: "playing",
  });
  const [restartKey, setRestartKey] = useState(1);

  const handleStats = useCallback((nextStats) => {
    setStats(nextStats);
  }, []);

  const restart = () => {
    setStats({
      score: 0,
      streak: 0,
      timeLeft: GAME_SECONDS,
      gameState: "playing",
    });
    setJoystick({ x: 0, y: 0 });
    setRestartKey((k) => k + 1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050611] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,70,134,.27),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(80,235,255,.24),transparent_36%)]" />
      <div className="absolute left-0 right-0 top-0 z-20 p-4 md:p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/25 to-fuchsia-400/25 text-cyan-100 shadow-lg">
                <Bike size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-100/70">
                  3D Neon Runner
                </p>
                <h1 className="text-2xl font-black tracking-tight md:text-4xl">
                  Echo Eats: Midnight Delivery
                </h1>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/62">
              Stylized avatar inspired by your portrait: fluffy dark hair, black
              fit, food-delivery bag, cinematic neon city. Deliver to glowing
              drop zones before time runs out.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <HudCard icon={Trophy} label="Score" value={stats.score} />
            <HudCard icon={Zap} label="Streak" value={`${stats.streak}x`} />
            <HudCard icon={Timer} label="Time" value={`${stats.timeLeft}s`} />
          </div>
        </div>
      </div>

      <Canvas
        key={restartKey}
        shadows
        camera={{ position: [8, 8, 11], fov: 46 }}
        dpr={[1, 2]}
      >
        <GameScene joystick={joystick} onStats={handleStats} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-4 md:p-6">
        <div className="mx-auto flex max-w-6xl items-end justify-between gap-4">
          <div className="pointer-events-auto hidden rounded-[1.5rem] border border-white/10 bg-black/35 px-5 py-4 text-sm text-white/70 shadow-2xl backdrop-blur-xl md:block">
            <p className="font-bold text-white">Controls</p>
            <p>WASD / Arrow keys to move. Hit glowing delivery zones.</p>
          </div>

          <TouchControls setJoystick={setJoystick} />

          <div className="pointer-events-auto flex flex-col items-end gap-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/35 px-5 py-4 text-right shadow-2xl backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-end gap-2 text-cyan-100">
                <MapPin size={17} />
                <p className="text-xs font-black uppercase tracking-[0.25em]">
                  Mission
                </p>
              </div>
              <p className="max-w-[240px] text-sm text-white/66">
                Find the glowing box marker, step into the ring, and chain
                deliveries for bonus time.
              </p>
            </div>
            <button
              onClick={restart}
              className="rounded-2xl border border-cyan-200/20 bg-cyan-300/15 px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-cyan-100 shadow-2xl backdrop-blur-xl transition hover:bg-cyan-300/25 active:scale-95"
            >
              Restart Run
            </button>
          </div>
        </div>
      </div>

      {stats.gameState === "playing" && stats.streak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute left-1/2 top-[46%] z-20 -translate-x-1/2 rounded-full border border-yellow-200/20 bg-yellow-200/10 px-5 py-2 text-sm font-black uppercase tracking-[0.25em] text-yellow-100 shadow-2xl backdrop-blur-xl"
        >
          <span className="inline-flex items-center gap-2">
            <PackageCheck size={17} /> Delivery streak {stats.streak}x
          </span>
        </motion.div>
      )}
    </div>
  );
}
