import { Flex, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink to={to}>
      {({ isActive }: { isActive: boolean }) => (
        <Flex
          direction="row"
          align="center"
          px="16px"
          py="8px"
          gap="10px"
          bg={
            isActive
              ? '{colors.dashboard.navItem.activeBg}'
              : '{colors.dashboard.navItem.inactiveBg}'
          }
          borderRadius="12px"
        >
          <Text
            textStyle="accent"
            color={
              isActive
                ? '{colors.dashboard.navItem.activeText}'
                : '{colors.dashboard.navItem.inactiveText}'
            }
          >
            {label}
          </Text>
        </Flex>
      )}
    </NavLink>
  );
}

export default NavItem;
