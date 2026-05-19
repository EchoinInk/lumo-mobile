import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/theme/tokens';
import React from 'react';

export default function MoreScreen() {
  const menuItems = [
    { title: 'Budget', route: '/budget' },
    { title: 'Habits', route: '/habits' },
    { title: 'Settings', route: '/settings' },
  ];

  return (
    <Screen scrollable padded>
      <SectionHeader title="More" subtitle="Additional Features" />
      
      {menuItems.map((item, index) => (
        <Card key={index} variant="elevated" padding="lg" pressable style={styles.menuItem}>
          <Text variant="heading">{item.title}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = {
  menuItem: {
    marginBottom: Spacing.md,
  },
};
