
import { Creature, CREATURES } from "../art/creatures";
import "./CreatureBackground.css";

const POSITIONS = [
  // Left side
  { x: "7%", y: "12%", direction: "up" },
  { x: "7%", y: "37%", direction: "up" },
  { x: "7%", y: "62%", direction: "up" },
  { x: "7%", y: "87%", direction: "up" },

  { x: "19%", y: "24%", direction: "down" },
  { x: "19%", y: "49%", direction: "down" },
  { x: "19%", y: "74%", direction: "down" },
  { x: "19%", y: "94%", direction: "down" },

  // Right side
  { x: "81%", y: "12%", direction: "down" },
  { x: "81%", y: "37%", direction: "down" },
  { x: "81%", y: "62%", direction: "down" },
  { x: "81%", y: "87%", direction: "down" },

  { x: "93%", y: "24%", direction: "up" },
  { x: "93%", y: "49%", direction: "up" },
  { x: "93%", y: "74%", direction: "up" },
  { x: "93%", y: "94%", direction: "up" },
];

export function CreatureBackground() {
  return (
    <div className="creature-background" aria-hidden="true">
      {CREATURES.map((creature, index) => {
        const pos = POSITIONS[index];

        return (
          <div
            key={creature.id}
            className={`creature-background__animal creature-background__animal--${pos.direction}`}
            style={{
              left: pos.x,
              top: pos.y,
              animationDelay: `${(index % 4) * -1.2}s`,
            }}
          >
            <Creature spec={creature} size={56} />
          </div>
        );
      })}
    </div>
  );
}
