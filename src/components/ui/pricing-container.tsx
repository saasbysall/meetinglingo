
"use client"
import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion'
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'

export interface PricingPlan {
    name: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    isPopular?: boolean;
    accent: string;
    rotation?: number;
    freeMinutes?: number;
    includedMinutes?: number;
    extraMinutesRate?: number;
}

interface PricingProps {
    title?: string;
    plans: PricingPlan[];
    className?: string;
    onGetStarted?: (planName: string) => void;
}

// Counter Component
const Counter = ({ from, to }: { from: number; to: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    React.useEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        const controls = animate(from, to, {
            duration: 1,
            onUpdate(value) {
                node.textContent = value.toFixed(0);
            },
        });
        return () => controls.stop();
    }, [from, to]);
    return <span ref={nodeRef} />;
};

// Header Component
const PricingHeader = ({ title }: { title: string }) => (
    <div className="text-center mb-4 sm:mb-6 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
        >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 
                bg-gradient-to-r from-white to-gray-100 px-6 py-3 rounded-xl border-4 border-black
                shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9),_15px_15px_15px_-3px_rgba(0,0,0,0.1)]
                transform transition-transform hover:translate-x-1 hover:translate-y-1 mb-3 relative
                before:absolute before:inset-0 before:bg-white/50 before:rounded-xl before:blur-sm before:-z-10">
                {title}
            </h1>
            <motion.div
                className="h-2 bg-gradient-to-r from-black via-gray-600 to-black rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 }}
            />
        </motion.div>
    </div>
);

// Toggle Component
const PricingToggle = ({ isYearly, onToggle }: { isYearly: boolean; onToggle: () => void }) => (
    <div className="flex justify-center items-center gap-4 mb-8 relative z-10">
        <span className={`text-gray-600 font-medium ${!isYearly ? 'text-black' : ''}`}>Pay Monthly</span>
        <motion.button
            className="w-16 h-8 flex items-center bg-gray-200 rounded-full p-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            onClick={onToggle}
        >
            <motion.div
                className="w-6 h-6 bg-white rounded-full border-2 border-black"
                animate={{ x: isYearly ? 32 : 0 }}
            />
        </motion.button>
        <span className={`text-gray-600 font-medium ${isYearly ? 'text-black' : ''}`}>Pay Yearly</span>
        {isYearly && (
            <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-blue-500 font-medium text-sm"
            >
                Save 20%
            </motion.span>
        )}
    </div>
);

// Background Effects Component
const BackgroundEffects = () => (
    <>
        <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-black/5 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
        <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)",
            backgroundSize: "16px 16px"
        }} />
    </>
);

// Minutes Slider Component
const MinutesSlider = ({ 
    value, 
    onChange, 
    min = 150, 
    max = 2500 
}: { 
    value: number; 
    onChange: (value: number) => void; 
    min?: number; 
    max?: number; 
}) => {
    const steps = [
        { value: 150, label: '150 mins' },
        { value: 400, label: '400 mins' },
        { value: 2500, label: '2500 mins' },
    ];

    const getClosestStep = (val: number) => {
        return steps.reduce((prev, curr) => {
            return Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev;
        });
    };

    const handleChange = (newValue: number[]) => {
        const step = getClosestStep(newValue[0]);
        onChange(step.value);
    };

    const progress = ((value - min) / (max - min)) * 100;

    return (
        <div className="w-full mt-4">
            <Progress value={progress} className="h-2 mb-2" />
            
            <Slider
                value={[value]}
                min={min}
                max={max}
                step={1}
                onValueChange={handleChange}
                className="w-full"
            />
            
            <div className="flex justify-between mt-2 text-sm text-gray-600">
                {steps.map((step) => (
                    <span 
                        key={step.value}
                        className={value === step.value ? "font-bold text-black" : ""}
                    >
                        {step.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

// Pricing Card Component
const PricingCard = ({
    plan,
    isYearly,
    index,
    onGetStarted
}: {
    plan: PricingPlan;
    isYearly: boolean;
    index: number;
    onGetStarted?: (planName: string) => void;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

    const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const previousPrice = !isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    
    const [selectedMinutes, setSelectedMinutes] = useState(plan.includedMinutes || 400);

    const handleClick = () => {
        if (onGetStarted) {
            onGetStarted(plan.name);
        }
    };

    const isEnterprise = plan.name === "Enterprise";

    return (
        <motion.div
            ref={cardRef}
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            style={{
                rotateX,
                rotateY,
                perspective: 1000,
            }}
            onMouseMove={(e) => {
                if (!cardRef.current) return;
                const rect = cardRef.current.getBoundingClientRect();
                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;
                mouseX.set((e.clientX - centerX) / rect.width);
                mouseY.set((e.clientY - centerY) / rect.height);
            }}
            onMouseLeave={() => {
                mouseX.set(0);
                mouseY.set(0);
            }}
            className={`relative w-full bg-white rounded-xl p-6 border-3 border-black
                shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]
                hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]
                transition-all duration-200`}
        >
            {/* Plan Name and Description */}
            <div className="mb-3">
                <h3 className="text-xl font-black text-black mb-1">{plan.name}</h3>
                {plan.description && (
                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                )}
                
                {plan.freeMinutes && !isEnterprise && (
                    <div className="text-blue-500 text-sm font-semibold mb-2">
                        {plan.freeMinutes} free minutes
                    </div>
                )}
            </div>
            
            {/* Price Display */}
            <div className="mb-4">
                {!isEnterprise ? (
                    <div className="flex items-baseline">
                        <span className="text-4xl font-black text-black">
                            ${isYearly ? 
                                <Counter from={previousPrice} to={currentPrice} /> : 
                                <Counter from={previousPrice} to={currentPrice} />}
                        </span>
                        <span className="text-gray-600 ml-1">/per month</span>
                    </div>
                ) : (
                    <div className="text-3xl font-black text-black">
                        Custom Pricing
                    </div>
                )}
            </div>

            {/* Minutes Slider - Only for non-enterprise plans */}
            {!isEnterprise && plan.includedMinutes && (
                <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">
                        {plan.freeMinutes} free min + {selectedMinutes} min /month
                        {plan.extraMinutesRate && ` • Extra: $${plan.extraMinutesRate}/per min`}
                    </div>
                    <MinutesSlider 
                        value={selectedMinutes} 
                        onChange={setSelectedMinutes} 
                    />
                </div>
            )}
            
            {/* CTA Button */}
            <motion.button
                onClick={handleClick}
                className={cn(
                    `w-full py-3 px-4 rounded-lg text-white font-black text-sm
                    border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]
                    hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]
                    active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]
                    transition-all duration-200 mb-4`
                    , isEnterprise ? 'bg-gray-700' : plan.accent)}
                whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 }
                }}
                whileTap={{
                    scale: 0.95,
                    rotate: [-1, 1, 0],
                }}
            >
                {isEnterprise ? 'CONTACT SALES' : (
                    <div className="flex flex-col items-center">
                        <span>START 7-DAYS TRIAL</span>
                        <span className="text-xs font-medium opacity-80">money back guarantee</span>
                    </div>
                )}
            </motion.button>

            {/* Features List */}
            <div className="space-y-2">
                {!isEnterprise && (
                    <div className="text-sm font-medium mb-2 text-gray-800">
                        {isEnterprise ? 'any number of minutes' : (
                            <>
                                <span className="font-bold">{selectedMinutes} minutes</span> of AI voice translation
                            </>
                        )}
                    </div>
                )}
                
                {plan.features.map((feature, i) => (
                    <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{
                            x: 5,
                            scale: 1.02,
                            transition: { type: "spring", stiffness: 400 }
                        }}
                        className={`flex items-center gap-2 p-2 bg-gray-50 rounded-md border-2 border-black
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]`}
                    >
                        <motion.span
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            className={cn(
                                `w-5 h-5 rounded-md flex items-center justify-center
                                text-white font-bold text-xs border border-black
                                shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]`
                                , plan.accent)}
                        >
                            ✓
                        </motion.span>
                        <span className="text-black font-bold text-sm">{feature}</span>
                    </motion.div>
                ))}
                
                {isEnterprise && (
                    <div className="text-sm text-center text-gray-600 mt-4">
                        any number of minutes
                    </div>
                )}
            </div>
            
            {/* Popular Badge */}
            {plan.isPopular && (
                <motion.span
                    className={cn(
                        `absolute -top-4 -right-4 px-3 py-1 text-white
                        font-bold rounded-md text-xs border-2 border-black
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]`
                        , plan.accent)}
                    animate={{
                        y: [0, -3, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                >
                    POPULAR
                </motion.span>
            )}
        </motion.div>
    );
};

// Main Container Component
export const PricingContainer = ({ title = "Choose Your Perfect Plan", plans, className = "", onGetStarted }: PricingProps) => {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <div className={`min-h-screen bg-[#f0f0f0] p-4 sm:p-6 lg:p-8 relative overflow-hidden rounded-[12px] ${className}`}>
            <PricingHeader title={title} />
            <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />
            <BackgroundEffects />

            <div className="w-[100%] max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mt-4">
                {plans.map((plan, index) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        isYearly={isYearly}
                        index={index}
                        onGetStarted={onGetStarted}
                    />
                ))}
            </div>
        </div>
    );
};
