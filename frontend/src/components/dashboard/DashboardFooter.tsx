import { Flex, Text } from '@chakra-ui/react';

function DashboardFooter() {
  return (
    <Flex
      as="footer"
      justify="center"
      align="center"
      p="16px"
      w="100%"
      color="{colors.dashboard.sidebar.copyright}"
    >
      <Text textStyle="normal" whiteSpace="nowrap">
        Copyright DataShare&copy; {new Date().getFullYear()}
      </Text>
    </Flex>
  );
}

export default DashboardFooter;
