import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface UserCardProps {
  image: string;
  name: string;
  age: number;
  country: string;
  flag: string;
  online?: boolean;
  delay?: number;
}

const UserCard = ({ image, name, age, country, flag, online = true, delay = 0 }: UserCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden group cursor-pointer glass-card border-none"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Blurred rotating image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover blur-md brightness-75"
          animate={{ 
            rotate: [0, 2, -2, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onError={(e) => {
            e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
          }}
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* "Start Matching Now!!!" overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.1, 1],
              opacity: 1
            }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="text-center"
          >
            <Heart className="w-12 h-12 text-primary mx-auto mb-3 drop-shadow-lg" fill="currentColor" />
            <h3 className="text-white font-heading font-bold text-2xl drop-shadow-lg mb-1">
              Start Matching
            </h3>
            <p className="text-white font-heading font-bold text-xl drop-shadow-lg">
              Now!!!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />

      {online && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-full px-2.5 py-1 z-20">
          <div className="w-2 h-2 rounded-full bg-online-green animate-pulse" />
          <span className="text-[10px] font-medium text-foreground uppercase tracking-wider">Online</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 z-20">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{flag}</span>
          <span className="font-heading font-semibold text-foreground text-sm">
            {name}, {age}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
