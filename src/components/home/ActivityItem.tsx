interface ActivityItemProps {
  avatar: string;
  avatarAlt: string;
  avatarBg: string;
  text: string;
  time: string;
}

export default function ActivityItem({ avatar, avatarAlt, avatarBg, text, time }: ActivityItemProps) {
  return (
    <div className="flex gap-md">
      <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        <img src={avatar} alt={avatarAlt} className="rounded-full w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-base text-on-surface">{text}</p>
        <p className="text-xs text-on-surface-variant">{time}</p>
      </div>
    </div>
  );
}
