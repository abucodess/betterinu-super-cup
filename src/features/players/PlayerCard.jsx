import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cloudinaryService } from '../../services/cloudinary/cloudinary.service';

/**
 * Pre-Made eFootball Player Card Display Component.
 * Supports compact sizing ('xs' | 'sm' | 'md') so Admin drag-and-drop boards
 * and public live draw grids fit many cards cleanly without scrolling.
 */
export function PlayerCard({
  player,
  team,
  variant = 'full',
  size = 'sm',
  onSelect,
  className = '',
  actionSlot = null,
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [player?.photo_url]);

  if (!player) return null;

  const resolvedTeam = team || player.team || null;
  const teamColor = resolvedTeam?.color_code || '#B8F34A';
  const surname = player.name
    ? player.name.trim().split(/\s+/).slice(-1)[0].toUpperCase()
    : 'PLAYER';

  const rawCardUrl = cloudinaryService.getOptimizedPortraitUrl(player.photo_url);
  const cardImageUrl = !imgError && rawCardUrl ? rawCardUrl : '';

  // COMPACT PITCH MARKER (Used on the 5-a-side tactical pitch)
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={() => onSelect && onSelect(player)}
        className={`group relative flex flex-col items-center w-[68px] sm:w-[80px] select-none transition-transform duration-150 hover:-translate-y-1 hover:scale-105 focus:outline-none ${className}`}
        aria-label={`Inspect ${player.name}, ${player.position}`}
      >
        {cardImageUrl ? (
          <div className="w-12 sm:w-14 aspect-[3/4] rounded-lg overflow-hidden drop-shadow-[0_6px_12px_rgba(0,0,0,0.75)]">
            <img
              key={cardImageUrl}
              src={cardImageUrl}
              alt={player.name}
              onError={() => setImgError(true)}
              draggable={false}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#141414] border-2 border-[#303030] group-hover:border-[#B8F34A] flex flex-col items-center justify-center shadow-lg">
            <span className="text-xs font-black text-[#B8F34A] tabular-nums leading-none">
              #{player.jersey_number}
            </span>
            <span className="text-[8px] font-bold text-[#9AA69B] uppercase mt-0.5">
              {player.position}
            </span>
          </div>
        )}
        <span className="mt-1 px-1.5 py-0.5 rounded bg-[#090909]/90 border border-white/10 text-[9px] font-bold text-[#F4F7F2] truncate max-w-full">
          {surname}
        </span>
      </button>
    );
  }

  const maxWidthClass =
    size === 'xs'
      ? 'max-w-[92px] sm:max-w-[104px]'
      : size === 'md'
      ? 'max-w-[165px] sm:max-w-[185px]'
      : 'max-w-[120px] sm:max-w-[134px]';

  // PRE-MADE EFOOTBALL CARD VIEW
  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <div
        onClick={() => onSelect && onSelect(player)}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        onKeyDown={(e) => {
          if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect(player);
          }
        }}
        className={`group relative w-full ${maxWidthClass} select-none transition-all duration-150 ${
          onSelect ? 'cursor-pointer hover:-translate-y-0.5' : ''
        }`}
      >
        {cardImageUrl ? (
          <div
            className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#141414]/70 border border-[#262626] group-hover:border-[#B8F34A]/60 flex items-center justify-center ${
              size === 'xs' ? 'p-0.5' : 'p-1'
            } shadow-md`}
          >
            <img
              key={cardImageUrl}
              src={cardImageUrl}
              alt={`${player.name} eFootball Card`}
              onError={() => setImgError(true)}
              draggable={false}
              className="w-full h-full object-contain rounded-lg pointer-events-none"
            />
          </div>
        ) : (
          /* Clean Minimal Fallback When No Pre-Made Card Image Has Been Uploaded Yet */
          <div
            className={`relative w-full aspect-[3/4] rounded-xl bg-[#141414] border border-[#262626] group-hover:border-[#B8F34A]/50 ${
              size === 'xs' ? 'p-2' : 'p-2.5'
            } flex flex-col justify-between shadow-md`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="px-1.5 py-0.5 rounded bg-[#202020] border border-[#303030] text-[9px] font-bold text-[#B8F34A]">
                {player.position}
              </span>
              <span className="text-[10px] font-black text-[#9AA69B] tabular-nums">
                #{player.jersey_number}
              </span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center text-center py-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-[#090909] mb-1 shadow"
                style={{ backgroundColor: teamColor }}
              >
                {resolvedTeam?.short_code || <ImageIcon className="w-3.5 h-3.5" />}
              </div>
              <p className="text-[10px] font-bold text-[#F4F7F2] line-clamp-1 leading-tight">
                {player.name}
              </p>
            </div>

            <div className="pt-1 border-t border-[#262626] text-center">
              <span className="text-[8px] text-[#9AA69B] block truncate">
                {resolvedTeam?.short_code || 'Unassigned'}
              </span>
            </div>
          </div>
        )}

        {/* Compact Player Name & Team Caption Under Uploaded Card */}
        {cardImageUrl && (
          <div className="mt-1 flex items-center justify-between gap-1 px-0.5">
            <span
              className={`${
                size === 'xs' ? 'text-[10px]' : 'text-[11px]'
              } font-bold text-[#F4F7F2] truncate`}
            >
              #{player.jersey_number} {player.name}
            </span>
            <span className="text-[9px] font-semibold text-[#B8F34A] shrink-0">
              {resolvedTeam?.short_code || player.position}
            </span>
          </div>
        )}
      </div>

      {/* Optional Action Slot (Drag/Assign or Edit/Delete) */}
      {actionSlot && (
        <div
          className={`mt-1 w-full ${maxWidthClass} ${
            size === 'xs' ? 'px-1.5 py-1 rounded-lg' : 'px-2 py-1.5 rounded-xl'
          } bg-[#141414] border border-[#262626]`}
          onClick={(e) => e.stopPropagation()}
        >
          {actionSlot}
        </div>
      )}
    </div>
  );
}

export default PlayerCard;
