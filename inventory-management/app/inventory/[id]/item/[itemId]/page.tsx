"use client";

import { useState } from "react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Heart, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function ItemPage({ params }: { params: { id: string, itemId: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(12);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className="flex flex-col gap-8 py-8 items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl flex justify-between items-center bg-content1 p-6 rounded-2xl shadow-sm border border-default-200"
      >
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="flat" onPress={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Item: {params.itemId}</h1>
            <p className="text-default-500">Inventory: Office Hardware</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="flat" 
            color={isLiked ? "danger" : "default"} 
            startContent={<Heart size={18} fill={isLiked ? "currentColor" : "none"} />}
            onPress={handleLike}
          >
            {likesCount} Likes
          </Button>
          <Button color="primary" startContent={<Save size={18} />}>
            Save Item
          </Button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Standard Fields */}
        <div className="flex flex-col gap-6 bg-content1 p-8 rounded-2xl shadow-sm border border-default-200">
          <h2 className="text-xl font-bold border-b border-default-200 pb-2">Standard Fields</h2>
          
          <Input 
            label="Custom ID" 
            defaultValue={params.itemId} 
            variant="bordered" 
            description="Auto-generated but editable. Must match inventory format rules."
          />
          <Input 
            label="Item Name" 
            defaultValue="Dell XPS 13" 
            variant="bordered" 
          />
          
          <div className="flex flex-col gap-1 mt-4 text-sm text-default-500 bg-default-100 p-4 rounded-lg">
            <p><strong>Created By:</strong> Alice Smith</p>
            <p><strong>Created At:</strong> Oct 24, 2026, 14:30</p>
            <p><strong>Last Modified:</strong> Oct 25, 2026, 09:15</p>
          </div>
        </div>

        {/* Custom Fields defined by Inventory Creator */}
        <div className="flex flex-col gap-6 bg-content1 p-8 rounded-2xl shadow-sm border border-default-200">
          <h2 className="text-xl font-bold border-b border-default-200 pb-2 flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Custom Fields</span>
          </h2>
          
          {/* Single-line text */}
          <Input 
            label="Condition" 
            defaultValue="Good" 
            variant="bordered" 
            description="E.g., New, Good, Fair, Poor"
          />
          
          {/* Numeric field */}
          <Input 
            label="Purchase Year" 
            type="number"
            defaultValue="2024" 
            variant="bordered" 
          />

          {/* Multi-line text field */}
          <Textarea 
            label="Staff Notes" 
            defaultValue="Minor scratch on the bottom lid. Battery health at 92%." 
            variant="bordered" 
          />

          {/* Document/Image Link field */}
          <Input 
            label="Receipt Document" 
            type="url"
            defaultValue="https://example.com/receipts/dell-xps-13.pdf" 
            variant="bordered" 
            startContent={<LinkIcon size={16} className="text-default-400"/>}
          />
          
          {/* Checkbox / Boolean field */}
          <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg border border-default-200">
            <div>
              <p className="font-semibold text-sm">Requires Maintenance</p>
              <p className="text-xs text-default-500">Check if item needs repair</p>
            </div>
            <Switch defaultSelected={false} color="warning" />
          </div>

        </div>
      </motion.div>
    </div>
  );
}
