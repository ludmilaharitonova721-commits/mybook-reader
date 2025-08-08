"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Share2, Check, Copy, MessageCircle, Globe, Users } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
}

interface SocialShareProps {
  book: Book;
  progress?: number;
  shareType: 'book' | 'progress' | 'achievement';
}

interface Platform {
  name: string;
  icon: React.ReactNode;
  color: string;
  handler: (text: string, book: Book) => void;
}

export const SocialShare = ({ book, progress = 0, shareType }: SocialShareProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copying, setCopying] = useState(false);

  const generateShareText = () => {
    const appUrl = window.location.origin;
    const bookUrl = `${appUrl}/books/${book.id}`;
    
    switch (shareType) {
      case 'book':
        return {
          text: `Читаю книгу "${book.title}" от ${book.author} в My Book`,
          url: bookUrl
        };
      case 'progress':
        return {
          text: `Прочитал ${progress}% книги "${book.title}" в My Book`,
          url: bookUrl
        };
      case 'achievement':
        return {
          text: `Завершил чтение "${book.title}" в My Book`,
          url: bookUrl
        };
      default:
        return {
          text: `Читаю "${book.title}" в My Book`,
          url: bookUrl
        };
    }
  };

  const shareToVK = (text: string, book: Book) => {
    const { url } = generateShareText();
    const shareUrl = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success('Поделились в VK');
  };

  const shareToTelegram = (text: string, book: Book) => {
    const { url } = generateShareText();
    const fullText = `${text}\n${url}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    toast.success('Поделились в Telegram');
  };

  const shareToFacebook = (text: string, book: Book) => {
    const { url } = generateShareText();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success('Поделились в Facebook');
  };

  const shareToTwitter = (text: string, book: Book) => {
    const { url } = generateShareText();
    const fullText = `${text}\n${url}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    toast.success('Поделились в Twitter');
  };

  const shareToWhatsApp = (text: string, book: Book) => {
    const { url } = generateShareText();
    const fullText = `${text}\n${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
    window.open(shareUrl, '_blank');
    toast.success('Поделились в WhatsApp');
  };

  const copyToClipboard = async (text: string, book: Book) => {
    setCopying(true);
    try {
      const { url } = generateShareText();
      const fullText = `${text}\n${url}`;
      await navigator.clipboard.writeText(fullText);
      toast.success('Ссылка скопирована в буфер обмена');
    } catch (error) {
      toast.error('Не удалось скопировать ссылку');
    } finally {
      setCopying(false);
    }
  };

  // Custom VK icon component
  const VKIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.6-.19 1.37 1.26 2.185 1.817.615.42 1.083.328 1.083.328l2.175-.03s1.137-.071.597-.965c-.044-.073-.313-.66-1.612-1.86-1.36-1.257-1.18-1.053.46-3.226.997-1.32 1.394-2.126 1.27-2.472-.118-.33-.847-.243-.847-.243l-2.45.015s-.18-.025-.314.056c-.13.08-.214.266-.214.266s-.383 1.02-.893 1.888c-1.077 1.83-1.506 1.926-1.683 1.812-.41-.267-.308-1.072-.308-1.644 0-1.778.27-2.522-.526-2.714-.264-.064-.457-.106-1.13-.113-.863-.009-1.593.003-2.006.205-.275.135-.487.435-.358.452.16.021.522.098.713.36.247.338.238 1.09.238 1.09s.142 2.094-.33 2.354c-.324.18-.77-.187-1.726-1.856-.49-.85-.86-1.784-.86-1.784s-.071-.175-.198-.269c-.154-.114-.37-.15-.37-.15l-2.33.015s-.35.01-.477.162c-.113.135-.009.414-.009.414s1.797 4.204 3.832 6.328c1.87 1.948 3.99 1.821 3.99 1.821h.96z"/>
    </svg>
  );

  const platforms: Platform[] = [
    {
      name: 'VK',
      icon: <VKIcon />,
      color: 'hover:bg-[#0077ff]/10 hover:text-[#0077ff]',
      handler: shareToVK
    },
    {
      name: 'Telegram',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'hover:bg-[#0088cc]/10 hover:text-[#0088cc]',
      handler: shareToTelegram
    },
    {
      name: 'Facebook',
      icon: <Globe className="w-5 h-5" />,
      color: 'hover:bg-[#1877f2]/10 hover:text-[#1877f2]',
      handler: shareToFacebook
    },
    {
      name: 'Twitter',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'hover:bg-[#1da1f2]/10 hover:text-[#1da1f2]',
      handler: shareToTwitter
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'hover:bg-[#25d366]/10 hover:text-[#25d366]',
      handler: shareToWhatsApp
    }
  ];

  const { text } = generateShareText();

  const getShareTypeLabel = () => {
    switch (shareType) {
      case 'book':
        return 'Поделиться книгой';
      case 'progress':
        return 'Поделиться прогрессом';
      case 'achievement':
        return 'Поделиться достижением';
      default:
        return 'Поделиться';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          {getShareTypeLabel()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {getShareTypeLabel()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Book Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 bg-gradient-to-b from-primary/20 to-primary/10 rounded-md flex items-center justify-center">
                  {book.cover ? (
                    <img 
                      src={book.cover} 
                      alt={book.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-primary/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-text-primary line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {book.author}
                  </p>
                  {shareType === 'progress' && progress > 0 && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {progress}% прочитано
                    </Badge>
                  )}
                  {shareType === 'achievement' && (
                    <Badge className="mt-2 text-xs bg-accent text-white">
                      Завершено
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Text Preview */}
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm text-text-secondary mb-2">Текст для публикации:</p>
            <p className="text-sm text-text-primary italic">"{text}"</p>
          </div>

          {/* Social Platforms Grid */}
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                className={`h-16 flex-col gap-2 transition-all duration-200 ${platform.color}`}
                onClick={() => platform.handler(text, book)}
              >
                {platform.icon}
                <span className="text-xs font-medium">{platform.name}</span>
              </Button>
            ))}
          </div>

          {/* Copy Link Button */}
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => copyToClipboard(text, book)}
            disabled={copying}
          >
            {copying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                Копирование...
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Скопировать ссылку
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};